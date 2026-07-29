import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import type { CreateMomentInput, Moment, UpdateMomentInput } from '../src/types'
import { validateMoment } from '../src/lib/services/momentValidation'

const DEFAULT_DATA_FILE = path.resolve(
  process.cwd(),
  '.gratefulness-data',
  'moments.json'
)

interface MomentRepositoryOptions {
  dataFile?: string
}

/**
 * Newest first, tiebreaking same-day moments by creation time.
 * Unlike entries, moment_date is not unique, so the tiebreak is required
 * for a stable order.
 */
function sortMoments(moments: Moment[]): Moment[] {
  return [...moments].sort(
    (a, b) =>
      b.moment_date.localeCompare(a.moment_date) || b.created_at - a.created_at
  )
}

function normalizeImportedMoment(moment: Moment): Moment {
  const now = Date.now()
  const description = moment.description?.trim()

  const normalized: Moment = {
    ...moment,
    id: moment.id || uuidv4(),
    title: moment.title?.trim() || '',
    description,
    created_at: moment.created_at ?? now,
    updated_at: moment.updated_at ?? moment.created_at ?? now,
  }

  if (normalized.description === undefined) {
    delete normalized.description
  }

  return normalized
}

export function createMomentRepository(options: MomentRepositoryOptions = {}) {
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

  async function readMoments(): Promise<Moment[]> {
    await ensureDataFile()
    const raw = await readFile(dataFile, 'utf8')
    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) {
      throw new Error('Stored moments data is invalid')
    }

    return parsed as Moment[]
  }

  async function writeMoments(moments: Moment[]): Promise<void> {
    await ensureDataFile()
    await writeFile(dataFile, `${JSON.stringify(moments, null, 2)}\n`, 'utf8')
  }

  async function withMutationLock<T>(operation: () => Promise<T>): Promise<T> {
    const next = mutationQueue.then(operation, operation)
    mutationQueue = next.then(
      () => undefined,
      () => undefined
    )
    return next
  }

  async function getMomentIndexById(id: string): Promise<[Moment[], number]> {
    const moments = await readMoments()
    const index = moments.findIndex((moment) => moment.id === id)
    return [moments, index]
  }

  return {
    async getAllMoments(): Promise<Moment[]> {
      return sortMoments(await readMoments())
    },

    async getMomentById(id: string): Promise<Moment | null> {
      const moments = await readMoments()
      return moments.find((moment) => moment.id === id) || null
    },

    /**
     * There is deliberately no duplicate-date check: any number of moments
     * may share a moment_date.
     */
    async createMoment(input: CreateMomentInput): Promise<Moment> {
      const validation = validateMoment(input)
      if (!validation.valid) {
        throw new Error(validation.errors.map((error) => error.message).join(', '))
      }

      return withMutationLock(async () => {
        const moments = await readMoments()
        const now = Date.now()
        const description = input.description?.trim()

        const moment: Moment = {
          id: uuidv4(),
          moment_date: input.moment_date,
          title: input.title.trim(),
          ...(description && { description }),
          rating: input.rating,
          created_at: now,
          updated_at: now,
        }

        moments.push(moment)
        await writeMoments(moments)
        return moment
      })
    },

    async updateMoment(id: string, updates: UpdateMomentInput): Promise<Moment> {
      const validation = validateMoment(updates, true)
      if (!validation.valid) {
        throw new Error(validation.errors.map((error) => error.message).join(', '))
      }

      return withMutationLock(async () => {
        const [moments, index] = await getMomentIndexById(id)

        if (index === -1) {
          throw new Error('Moment not found')
        }

        const existing = moments[index]
        // A blank description clears the field rather than storing ''
        const description =
          updates.description !== undefined
            ? updates.description.trim() || undefined
            : existing.description

        const updatedMoment: Moment = {
          ...existing,
          ...updates,
          title: updates.title?.trim() ?? existing.title,
          description,
          updated_at: Date.now(),
        }

        if (updatedMoment.description === undefined) {
          delete updatedMoment.description
        }

        moments[index] = updatedMoment
        await writeMoments(moments)
        return updatedMoment
      })
    },

    async deleteMoment(id: string): Promise<void> {
      await withMutationLock(async () => {
        const [moments, index] = await getMomentIndexById(id)

        if (index === -1) {
          throw new Error('Moment not found')
        }

        moments.splice(index, 1)
        await writeMoments(moments)
      })
    },

    /**
     * Deduped by id rather than by date, since moments have no
     * one-per-day constraint to key on.
     */
    async importMoments(incomingMoments: Moment[]): Promise<{ imported: number }> {
      return withMutationLock(async () => {
        const currentMoments = await readMoments()
        const momentsById = new Map(
          currentMoments.map((moment) => [moment.id, moment])
        )
        let imported = 0

        for (const incomingMoment of incomingMoments) {
          const normalizedMoment = normalizeImportedMoment(incomingMoment)
          const validation = validateMoment(normalizedMoment)

          if (!validation.valid) {
            continue
          }

          const existingMoment = momentsById.get(normalizedMoment.id)

          if (!existingMoment) {
            momentsById.set(normalizedMoment.id, normalizedMoment)
            imported++
            continue
          }

          if (normalizedMoment.updated_at > existingMoment.updated_at) {
            momentsById.set(normalizedMoment.id, normalizedMoment)
            imported++
          }
        }

        await writeMoments(Array.from(momentsById.values()))
        return { imported }
      })
    },

    async getMomentCount(): Promise<number> {
      const moments = await readMoments()
      return moments.length
    },
  }
}
