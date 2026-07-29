import Dexie, { Table } from 'dexie'
import { Entry, Moment } from '@/types'

/**
 * Legacy browser-local database.
 *
 * Entries and moments created before shared sync is enabled are migrated out
 * of this store into the shared file-backed API on first load. Nothing writes
 * here any more — see entryMigration.ts and momentMigration.ts for the drain,
 * and backupService.ts for backup/restore against the shared store.
 */
export class GratefulnessDB extends Dexie {
  // Declare tables
  entries!: Table<Entry, string>
  moments!: Table<Moment, string>

  constructor() {
    super('gratefulnessDB')

    this.version(1).stores({
      entries: 'id, &entry_date, created_at, updated_at, rating',
    })

    // Version 2: add moments table
    this.version(2).stores({
      // moment_date is NOT unique (no & prefix) — multiple moments per day allowed
      moments: 'id, moment_date, created_at, updated_at, rating',
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
 * Clear the legacy browser-local data (useful for testing/development)
 * WARNING: This will delete all legacy entries and moments permanently!
 * It does NOT touch the shared store behind the API.
 */
export async function clearDatabase(): Promise<void> {
  try {
    await db.entries.clear()
    await db.moments.clear()
    console.log('Database cleared successfully')
  } catch (error) {
    console.error('Failed to clear database:', error)
    throw error
  }
}
