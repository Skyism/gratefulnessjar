import Dexie, { Table } from 'dexie'
import { Entry, Moment } from '@/types'
import { isValidDateString } from '@/lib/services/dateService'

/**
 * GratefulnessDB - IndexedDB database for offline-first storage
 *
 * Uses Dexie.js as a type-safe wrapper around IndexedDB
 */
export class GratefulnessDB extends Dexie {
  // Declare tables
  entries!: Table<Entry, string>
  moments!: Table<Moment, string>

  constructor() {
    super('gratefulnessDB')

    // Define schema version 1
    this.version(1).stores({
      // Primary key: id (auto-indexed)
      // Unique index: &entry_date (& prefix means unique)
      // Additional indexes: created_at, updated_at for sorting
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
 * WARNING: This will delete all entries and moments permanently!
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

/**
 * Export all entries and moments as JSON (for backup)
 */
export async function exportDatabase(): Promise<string> {
  try {
    const entries = await db.entries.toArray()
    const moments = await db.moments.toArray()
    return JSON.stringify({ version: 2, exported_at: Date.now(), entries, moments }, null, 2)
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
 * Validate an untrusted imported value as a well-formed Moment
 * Mirrors the constraints enforced by momentService.validateMoment
 */
function isImportableMoment(value: unknown): value is Moment {
  if (typeof value !== 'object' || value === null) return false
  const m = value as Record<string, unknown>

  return (
    typeof m.id === 'string' &&
    m.id.length > 0 &&
    typeof m.moment_date === 'string' &&
    isValidDateString(m.moment_date) &&
    typeof m.title === 'string' &&
    m.title.trim().length > 0 &&
    m.title.length <= 100 &&
    (m.description === undefined ||
      (typeof m.description === 'string' && m.description.length <= 1000)) &&
    typeof m.rating === 'number' &&
    Number.isInteger(m.rating) &&
    m.rating >= 1 &&
    m.rating <= 7 &&
    typeof m.created_at === 'number' &&
    typeof m.updated_at === 'number' &&
    (m.synced_at === undefined || typeof m.synced_at === 'number') &&
    (m.deleted === undefined || typeof m.deleted === 'boolean')
  )
}

/**
 * Result of an import: how many of each record type were added
 */
export interface ImportResult {
  entriesImported: number
  momentsImported: number
}

/**
 * Import entries and moments from JSON (for restore)
 * Accepts the versioned envelope { entries, moments } as well as the
 * legacy format (a bare array of entries)
 * Note: This will merge with existing data, not replace
 */
export async function importDatabase(jsonData: string): Promise<ImportResult> {
  try {
    const parsed: unknown = JSON.parse(jsonData)

    let entryCandidates: unknown[]
    let momentCandidates: unknown[]

    if (Array.isArray(parsed)) {
      // Legacy format: bare array of entries
      entryCandidates = parsed
      momentCandidates = []
    } else if (typeof parsed === 'object' && parsed !== null) {
      const envelope = parsed as Record<string, unknown>
      entryCandidates = Array.isArray(envelope.entries) ? envelope.entries : []
      momentCandidates = Array.isArray(envelope.moments) ? envelope.moments : []
    } else {
      throw new Error('Invalid import data: expected an array of entries or an export object')
    }

    // Add entries (will skip duplicates due to unique entry_date)
    let entriesImported = 0
    for (const candidate of entryCandidates) {
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
        entriesImported++
      } catch (error) {
        // Skip duplicates (unique entry_date constraint)
        console.warn('Skipped entry:', entry.id, error)
      }
    }

    // Add moments (duplicates are skipped by primary-key id, not date)
    let momentsImported = 0
    for (const candidate of momentCandidates) {
      if (!isImportableMoment(candidate)) {
        console.warn('Skipped invalid moment:', candidate)
        continue
      }

      const moment: Moment = {
        id: candidate.id,
        moment_date: candidate.moment_date,
        title: candidate.title,
        rating: candidate.rating,
        created_at: candidate.created_at,
        updated_at: candidate.updated_at,
        ...(candidate.description !== undefined && { description: candidate.description }),
        ...(candidate.synced_at !== undefined && { synced_at: candidate.synced_at }),
        ...(candidate.deleted !== undefined && { deleted: candidate.deleted }),
      }

      try {
        await db.moments.add(moment)
        momentsImported++
      } catch (error) {
        console.warn('Skipped moment:', moment.id, error)
      }
    }

    return { entriesImported, momentsImported }
  } catch (error) {
    console.error('Failed to import database:', error)
    throw error
  }
}
