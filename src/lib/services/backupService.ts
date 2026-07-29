import type { Entry, Moment } from '@/types'
import { requestJson } from './apiClient'
import { isValidDateString } from './dateService'

/**
 * Backup / restore for the shared file-backed store.
 *
 * These read and write through /api/entries and /api/moments rather than the
 * legacy browser database, so a backup reflects what the app actually shows.
 */

/**
 * Export all entries and moments as JSON (for backup)
 */
export async function exportDatabase(): Promise<string> {
  try {
    const [entries, moments] = await Promise.all([
      requestJson<Entry[]>('/api/entries'),
      requestJson<Moment[]>('/api/moments'),
    ])

    return JSON.stringify(
      { version: 2, exported_at: Date.now(), entries, moments },
      null,
      2
    )
  } catch (error) {
    console.error('Failed to export data:', error)
    throw error
  }
}

/**
 * Validate an untrusted imported value as a well-formed Entry
 * Mirrors the constraints enforced by entryValidation.validateEntry
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
 * Mirrors the constraints enforced by momentValidation.validateMoment
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
      throw new Error(
        'Invalid import data: expected an array of entries or an export object'
      )
    }

    // Copy only known fields so imports can't inject extra data
    const entries: Entry[] = []
    for (const candidate of entryCandidates) {
      if (!isImportableEntry(candidate)) {
        console.warn('Skipped invalid entry:', candidate)
        continue
      }

      entries.push({
        id: candidate.id,
        entry_date: candidate.entry_date,
        gratitude_text: candidate.gratitude_text,
        rating: candidate.rating,
        created_at: candidate.created_at,
        updated_at: candidate.updated_at,
        ...(candidate.synced_at !== undefined && { synced_at: candidate.synced_at }),
        ...(candidate.deleted !== undefined && { deleted: candidate.deleted }),
      })
    }

    const moments: Moment[] = []
    for (const candidate of momentCandidates) {
      if (!isImportableMoment(candidate)) {
        console.warn('Skipped invalid moment:', candidate)
        continue
      }

      moments.push({
        id: candidate.id,
        moment_date: candidate.moment_date,
        title: candidate.title,
        rating: candidate.rating,
        created_at: candidate.created_at,
        updated_at: candidate.updated_at,
        ...(candidate.description !== undefined && {
          description: candidate.description,
        }),
        ...(candidate.synced_at !== undefined && { synced_at: candidate.synced_at }),
        ...(candidate.deleted !== undefined && { deleted: candidate.deleted }),
      })
    }

    // The server dedupes: entries by date, moments by id
    const [entryResult, momentResult] = await Promise.all([
      entries.length
        ? requestJson<{ imported: number }>('/api/entries/import', {
            method: 'POST',
            body: JSON.stringify(entries),
          })
        : Promise.resolve({ imported: 0 }),
      moments.length
        ? requestJson<{ imported: number }>('/api/moments/import', {
            method: 'POST',
            body: JSON.stringify(moments),
          })
        : Promise.resolve({ imported: 0 }),
    ])

    return {
      entriesImported: entryResult.imported,
      momentsImported: momentResult.imported,
    }
  } catch (error) {
    console.error('Failed to import data:', error)
    throw error
  }
}
