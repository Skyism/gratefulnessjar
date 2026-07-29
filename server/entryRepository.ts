import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import type { CreateEntryInput, Entry, UpdateEntryInput } from '../src/types'
import { getTodayDateString } from '../src/lib/services/dateService'
import { validateEntry } from '../src/lib/services/entryValidation'

const DEFAULT_DATA_FILE = path.resolve(
  process.cwd(),
  '.gratefulness-data',
  'entries.json'
)

interface EntryRepositoryOptions {
  dataFile?: string
}

function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date))
}

function normalizeImportedEntry(entry: Entry): Entry {
  const now = Date.now()

  return {
    ...entry,
    id: entry.id || uuidv4(),
    gratitude_text: entry.gratitude_text?.trim() || '',
    created_at: entry.created_at ?? now,
    updated_at: entry.updated_at ?? entry.created_at ?? now,
  }
}

export function createEntryRepository(
  options: EntryRepositoryOptions = {}
) {
  const dataFile = options.dataFile ?? DEFAULT_DATA_FILE
  let mutationQueue = Promise.resolve()

  async function ensureDataFile(): Promise<void> {
    await mkdir(path.dirname(dataFile), { recursive: true })

    try {
      await readFile(dataFile, 'utf8')
    } catch (error) {
      await writeFile(dataFile, '[]\n', 'utf8')
    }
  }

  async function readEntries(): Promise<Entry[]> {
    await ensureDataFile()
    const raw = await readFile(dataFile, 'utf8')
    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      throw new Error('Stored entries data is invalid')
    }

    return parsed as Entry[]
  }

  async function writeEntries(entries: Entry[]): Promise<void> {
    await ensureDataFile()
    await writeFile(dataFile, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
  }

  async function withMutationLock<T>(operation: () => Promise<T>): Promise<T> {
    const next = mutationQueue.then(operation, operation)
    mutationQueue = next.then(
      () => undefined,
      () => undefined
    )
    return next
  }

  async function getEntryIndexById(id: string): Promise<[Entry[], number]> {
    const entries = await readEntries()
    const index = entries.findIndex((entry) => entry.id === id)
    return [entries, index]
  }

  async function getEntryByDate(dateString: string): Promise<Entry | null> {
    const entries = await readEntries()
    return entries.find((entry) => entry.entry_date === dateString) || null
  }

  return {
    async getAllEntries(): Promise<Entry[]> {
      return sortEntries(await readEntries())
    },

    async getTodayEntry(): Promise<Entry | null> {
      return getEntryByDate(getTodayDateString())
    },

    getEntryByDate,

    async getEntryById(id: string): Promise<Entry | null> {
      const entries = await readEntries()
      return entries.find((entry) => entry.id === id) || null
    },

    async createEntry(input: CreateEntryInput): Promise<Entry> {
      const validation = validateEntry(input)
      if (!validation.valid) {
        throw new Error(validation.errors.map((error) => error.message).join(', '))
      }

      return withMutationLock(async () => {
        const entries = await readEntries()
        const existing = entries.find((entry) => entry.entry_date === input.entry_date)

        if (existing) {
          throw new Error(
            `An entry already exists for ${input.entry_date}. Please edit the existing entry instead.`
          )
        }

        const now = Date.now()
        const entry: Entry = {
          id: uuidv4(),
          entry_date: input.entry_date,
          gratitude_text: input.gratitude_text.trim(),
          rating: input.rating,
          created_at: now,
          updated_at: now,
        }

        entries.push(entry)
        await writeEntries(entries)
        return entry
      })
    },

    async updateEntry(id: string, updates: UpdateEntryInput): Promise<Entry> {
      const validation = validateEntry(updates, true)
      if (!validation.valid) {
        throw new Error(validation.errors.map((error) => error.message).join(', '))
      }

      return withMutationLock(async () => {
        const [entries, index] = await getEntryIndexById(id)

        if (index === -1) {
          throw new Error('Entry not found')
        }

        const existing = entries[index]
        const updatedEntry: Entry = {
          ...existing,
          ...updates,
          gratitude_text: updates.gratitude_text?.trim() ?? existing.gratitude_text,
          updated_at: Date.now(),
        }

        entries[index] = updatedEntry
        await writeEntries(entries)
        return updatedEntry
      })
    },

    async deleteEntry(id: string): Promise<void> {
      await withMutationLock(async () => {
        const [entries, index] = await getEntryIndexById(id)

        if (index === -1) {
          throw new Error('Entry not found')
        }

        entries.splice(index, 1)
        await writeEntries(entries)
      })
    },

    async importEntries(incomingEntries: Entry[]): Promise<{ imported: number }> {
      return withMutationLock(async () => {
        const currentEntries = await readEntries()
        const entriesByDate = new Map(
          currentEntries.map((entry) => [entry.entry_date, entry])
        )
        let imported = 0

        for (const incomingEntry of incomingEntries) {
          const normalizedEntry = normalizeImportedEntry(incomingEntry)
          const validation = validateEntry(normalizedEntry)

          if (!validation.valid) {
            continue
          }

          const existingEntry = entriesByDate.get(normalizedEntry.entry_date)

          if (!existingEntry) {
            entriesByDate.set(normalizedEntry.entry_date, normalizedEntry)
            imported++
            continue
          }

          if (normalizedEntry.updated_at > existingEntry.updated_at) {
            entriesByDate.set(normalizedEntry.entry_date, normalizedEntry)
            imported++
          }
        }

        await writeEntries(Array.from(entriesByDate.values()))
        return { imported }
      })
    },

    async getEntryCount(): Promise<number> {
      const entries = await readEntries()
      return entries.length
    },

    async getRandomEntry(): Promise<Entry | null> {
      const today = getTodayDateString()
      const entries = (await readEntries()).filter(
        (entry) => entry.entry_date !== today
      )

      if (entries.length === 0) {
        return null
      }

      const index = Math.floor(Math.random() * entries.length)
      return entries[index]
    },

    async searchEntries(query: string): Promise<Entry[]> {
      const normalizedQuery = query.toLowerCase().trim()

      if (!normalizedQuery) {
        return []
      }

      return sortEntries(await readEntries()).filter((entry) =>
        entry.gratitude_text.toLowerCase().includes(normalizedQuery)
      )
    },
  }
}
