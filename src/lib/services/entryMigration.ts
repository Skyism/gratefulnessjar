import { db } from '@/lib/db/schema'
import type { Entry } from '@/types'
import { requestJson } from './entryApi'

let migrationPromise: Promise<void> | null = null

async function migrateLegacyEntriesToSharedStore(): Promise<void> {
  try {
    const legacyEntries = await db.entries.toArray()

    if (legacyEntries.length === 0) {
      return
    }

    await requestJson<{ imported: number }>('/api/entries/import', {
      method: 'POST',
      body: JSON.stringify(legacyEntries),
    })
  } catch (error) {
    console.error('Failed to migrate legacy browser entries:', error)
  }
}

export function ensureLegacyEntriesMigrated(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = migrateLegacyEntriesToSharedStore()
  }

  return migrationPromise
}

export function resetLegacyMigrationForTests(): void {
  migrationPromise = null
}

export type { Entry }
