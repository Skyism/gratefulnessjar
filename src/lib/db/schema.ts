import Dexie, { Table } from 'dexie'
import { Entry } from '@/types'

/**
 * GratefulnessDB - IndexedDB database for offline-first storage
 *
 * Uses Dexie.js as a type-safe wrapper around IndexedDB
 */
export class GratefulnessDB extends Dexie {
  // Declare tables
  entries!: Table<Entry, string>

  constructor() {
    super('gratefulnessDB')

    // Define schema version 1
    this.version(1).stores({
      // Primary key: id (auto-indexed)
      // Unique index: &entry_date (& prefix means unique)
      // Additional indexes: created_at, updated_at for sorting
      entries: 'id, &entry_date, created_at, updated_at, rating',
    })
  }
}

/**
 * Export singleton instance of the database
 */
export const db = new GratefulnessDB()

/**
 * Initialize database and handle any setup
 * Call this once when the app starts
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
 * Import entries from JSON (for restore)
 * Note: This will merge with existing entries, not replace
 */
export async function importDatabase(jsonData: string): Promise<number> {
  try {
    const entries: Entry[] = JSON.parse(jsonData)

    // Validate entries
    if (!Array.isArray(entries)) {
      throw new Error('Invalid import data: expected array of entries')
    }

    // Add entries (will skip duplicates due to unique entry_date)
    let imported = 0
    for (const entry of entries) {
      try {
        await db.entries.add(entry)
        imported++
      } catch (error) {
        // Skip duplicates or invalid entries
        console.warn('Skipped entry:', entry.id, error)
      }
    }

    return imported
  } catch (error) {
    console.error('Failed to import database:', error)
    throw error
  }
}
