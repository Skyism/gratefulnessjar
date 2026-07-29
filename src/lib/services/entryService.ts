import type {
  Entry,
  CreateEntryInput,
  UpdateEntryInput,
} from '@/types'
import { getTodayDateString } from './dateService'
import { requestJson } from './entryApi'
import { ensureLegacyEntriesMigrated } from './entryMigration'
import { validateEntry } from './entryValidation'

/**
 * Entry Service - Business logic for entry CRUD operations
 *
 * All operations are async and return Promises
 * Validates input before database operations
 */

export { validateEntry } from './entryValidation'

async function ensureSharedStoreReady(): Promise<void> {
  await ensureLegacyEntriesMigrated()
}

/**
 * Get today's entry (if it exists)
 * @returns Entry or null if no entry for today
 */
export async function getTodayEntry(): Promise<Entry | null> {
  try {
    await ensureSharedStoreReady()
    return await requestJson<Entry | null>('/api/entries/today')
  } catch (error) {
    console.error('Failed to get today\'s entry:', error)
    throw new Error('Failed to load today\'s entry')
  }
}

/**
 * Get entry by date
 * @param dateString Date string (YYYY-MM-DD)
 * @returns Entry or null if not found
 */
export async function getEntryByDate(dateString: string): Promise<Entry | null> {
  try {
    await ensureSharedStoreReady()
    return await requestJson<Entry | null>(
      `/api/entries/date/${encodeURIComponent(dateString)}`
    )
  } catch (error) {
    console.error('Failed to get entry by date:', error)
    throw new Error(`Failed to load entry for ${dateString}`)
  }
}

/**
 * Get entry by ID
 * @param id Entry ID
 * @returns Entry or null if not found
 */
export async function getEntryById(id: string): Promise<Entry | null> {
  try {
    await ensureSharedStoreReady()
    return await requestJson<Entry | null>(`/api/entries/${encodeURIComponent(id)}`)
  } catch (error) {
    console.error('Failed to get entry by ID:', error)
    throw new Error(`Failed to load entry ${id}`)
  }
}

/**
 * Get all entries, sorted by date (newest first)
 * @returns Array of entries
 */
export async function getAllEntries(): Promise<Entry[]> {
  try {
    await ensureSharedStoreReady()
    return await requestJson<Entry[]>('/api/entries')
  } catch (error) {
    console.error('Failed to get all entries:', error)
    throw new Error('Failed to load entries')
  }
}

/**
 * Get entries in a date range
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Array of entries
 */
export async function getEntriesInRange(
  startDate: string,
  endDate: string
): Promise<Entry[]> {
  try {
    const entries = await getAllEntries()
    return entries.filter(
      (entry) => entry.entry_date >= startDate && entry.entry_date <= endDate
    )
  } catch (error) {
    console.error('Failed to get entries in range:', error)
    throw new Error('Failed to load entries')
  }
}

/**
 * Create a new entry
 * @param input Entry data (without id, timestamps)
 * @returns Created entry
 * @throws Error if validation fails or entry already exists for this date
 */
export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  const validation = validateEntry(input)
  if (!validation.valid) {
    throw new Error(
      validation.errors.map((e) => e.message).join(', ')
    )
  }

  try {
    await ensureSharedStoreReady()
    return await requestJson<Entry>('/api/entries', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  } catch (error) {
    console.error('Failed to create entry:', error)
    throw error instanceof Error ? error : new Error('Failed to save entry')
  }
}

/**
 * Create entry for today
 * @param input Entry data (entry_date will be set to today)
 * @returns Created entry
 */
export async function createTodayEntry(
  input: Omit<CreateEntryInput, 'entry_date'>
): Promise<Entry> {
  return createEntry({
    ...input,
    entry_date: getTodayDateString(),
  })
}

/**
 * Update an existing entry
 * @param id Entry ID
 * @param updates Fields to update
 * @returns Updated entry
 * @throws Error if entry not found or validation fails
 */
export async function updateEntry(
  id: string,
  updates: UpdateEntryInput
): Promise<Entry> {
  const validation = validateEntry(updates, true)
  if (!validation.valid) {
    throw new Error(
      validation.errors.map((e) => e.message).join(', ')
    )
  }

  try {
    await ensureSharedStoreReady()
    return await requestJson<Entry>(`/api/entries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  } catch (error) {
    console.error('Failed to update entry:', error)
    throw error instanceof Error ? error : new Error('Failed to update entry')
  }
}

/**
 * Delete an entry
 * @param id Entry ID
 * @throws Error if entry not found
 */
export async function deleteEntry(id: string): Promise<void> {
  try {
    await ensureSharedStoreReady()
    await requestJson<null>(`/api/entries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Failed to delete entry:', error)
    throw error instanceof Error ? error : new Error('Failed to delete entry')
  }
}

/**
 * Get count of total entries
 * @returns Number of entries
 */
export async function getEntryCount(): Promise<number> {
  try {
    const entries = await getAllEntries()
    return entries.length
  } catch (error) {
    console.error('Failed to get entry count:', error)
    return 0
  }
}

/**
 * Get a random entry (excluding today)
 * Useful for "jar mode" feature
 * @returns Random entry or null if no entries
 */
export async function getRandomEntry(): Promise<Entry | null> {
  try {
    await ensureSharedStoreReady()
    return await requestJson<Entry | null>('/api/entries/random')
  } catch (error) {
    console.error('Failed to get random entry:', error)
    return null
  }
}

/**
 * Search entries by text
 * @param query Search query
 * @returns Array of matching entries
 */
export async function searchEntries(query: string): Promise<Entry[]> {
  try {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) {
      return []
    }

    const allEntries = await getAllEntries()
    return allEntries.filter((entry) =>
      entry.gratitude_text.toLowerCase().includes(normalizedQuery)
    )
  } catch (error) {
    console.error('Failed to search entries:', error)
    return []
  }
}
