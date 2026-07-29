import { db } from '@/lib/db/schema'
import type { Moment } from '@/types'
import { requestJson } from './apiClient'

let migrationPromise: Promise<void> | null = null

async function migrateLegacyMomentsToSharedStore(): Promise<void> {
  try {
    const legacyMoments = await db.moments.toArray()

    if (legacyMoments.length === 0) {
      return
    }

    await requestJson<{ imported: number }>('/api/moments/import', {
      method: 'POST',
      body: JSON.stringify(legacyMoments),
    })
  } catch (error) {
    console.error('Failed to migrate legacy browser moments:', error)
  }
}

export function ensureLegacyMomentsMigrated(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = migrateLegacyMomentsToSharedStore()
  }

  return migrationPromise
}

export function resetLegacyMomentMigrationForTests(): void {
  migrationPromise = null
}

export type { Moment }
