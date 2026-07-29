import Dexie, { Table } from 'dexie'
import { Entry } from '@/types'
import { isValidDateString } from '@/lib/services/dateService'

/**
 * Legacy browser-local database.
 *
 * Existing entries created before shared sync is enabled are migrated out of
 * this store into the shared file-backed API on first load.
 */
export class GratefulnessDB extends Dexie {
  // Declare tables
  entries!: Table<Entry, string>

  constructor() {
    super('gratefulnessDB')

    this.version(1).stores({
      entries: 'id, &entry_date, created_at, updated_at, rating',
    })
  }
}

/**
 * Export singleton instance of the database
 */
export const db = new GratefulnessDB()

/**
 * Legacy helper kept for migration tooling and development utilities.
 */
export async function initDatabase(): Promise<void> {
  try {
    // Open the database
    await db.open()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

/**
 * Clear all data from the database (useful for testing/development)
 * WARNING: This will delete all entries permanently!
 */
export async function clearDatabase(): Promise<void> {
  try {
    await db.entries.clear()
    console.log('Database cleared successfully')
  } catch (error) {
    console.error('Failed to clear database:', error)
    throw error
  }
}

/**
 * Export all entries as JSON (for backup)
 */
export async function exportDatabase(): Promise<string> {
  try {
    const entries = await db.entries.toArray()
    return JSON.stringify(entries, null, 2)
  } catch (error) {
    console.error('Failed to export database:', error)
    throw error
  }
}

/**
 * Validate an untrusted imported value as a well-formed Entry
 * Mirrors the constraints enforced by entryService.validateEntry
 */
function isImportableEntry(value: unknown): value is Entry {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>

  return (
    typeof e.id === 'string' &&
    e.id.length > 0 &&
    typeof e.entry_date === 'string' &&
    isValidDateString(e.entry_date) &&
    typeof e.gratitude_text === 'string' &&
    e.gratitude_text.trim().length > 0 &&
    e.gratitude_text.length <= 1000 &&
    typeof e.rating === 'number' &&
    Number.isInteger(e.rating) &&
    e.rating >= 1 &&
    e.rating <= 7 &&
    typeof e.created_at === 'number' &&
    typeof e.updated_at === 'number' &&
    (e.synced_at === undefined || typeof e.synced_at === 'number') &&
    (e.deleted === undefined || typeof e.deleted === 'boolean')
  )
}

/**
 * Import entries from JSON (for restore)
 * Note: This will merge with existing entries, not replace
 */
export async function importDatabase(jsonData: string): Promise<number> {
  try {
    const parsed: unknown = JSON.parse(jsonData)

    // Validate entries
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid import data: expected array of entries')
    }

    // Add entries (will skip duplicates due to unique entry_date)
    let imported = 0
    for (const candidate of parsed) {
      if (!isImportableEntry(candidate)) {
        console.warn('Skipped invalid entry:', candidate)
        continue
      }

      // Copy only known fields so imports can't inject extra data
      const entry: Entry = {
        id: candidate.id,
        entry_date: candidate.entry_date,
        gratitude_text: candidate.gratitude_text,
        rating: candidate.rating,
        created_at: candidate.created_at,
        updated_at: candidate.updated_at,
        ...(candidate.synced_at !== undefined && { synced_at: candidate.synced_at }),
        ...(candidate.deleted !== undefined && { deleted: candidate.deleted }),
      }

      try {
        await db.entries.add(entry)
        imported++
      } catch (error) {
        // Skip duplicates (unique entry_date constraint)
        console.warn('Skipped entry:', entry.id, error)
      }
    }

    return imported
  } catch (error) {
    console.error('Failed to import database:', error)
    throw error
  }
}
