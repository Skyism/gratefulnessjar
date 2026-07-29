import type {
  Moment,
  CreateMomentInput,
  UpdateMomentInput,
} from '@/types'
import { requestJson } from './apiClient'
import { ensureLegacyMomentsMigrated } from './momentMigration'
import { validateMoment } from './momentValidation'

/**
 * Moment Service - Business logic for "moments to remember" CRUD operations
 *
 * Backed by the shared file-based store via /api/moments, so moments are
 * visible from any device pointed at the same server.
 *
 * Unlike entries, moments have no one-per-day limit — any number of
 * moments can share a date, and moment_date is editable
 */

export { validateMoment } from './momentValidation'

async function ensureSharedStoreReady(): Promise<void> {
  await ensureLegacyMomentsMigrated()
}

/**
 * Get moment by ID
 * @param id Moment ID
 * @returns Moment or null if not found
 */
export async function getMomentById(id: string): Promise<Moment | null> {
  try {
    await ensureSharedStoreReady()
    return await requestJson<Moment | null>(
      `/api/moments/${encodeURIComponent(id)}`
    )
  } catch (error) {
    console.error('Failed to get moment by ID:', error)
    throw new Error(`Failed to load moment ${id}`)
  }
}

/**
 * Get all moments, sorted by date (newest first), same-day moments
 * ordered by creation time (newest first)
 * @returns Array of moments
 */
export async function getAllMoments(): Promise<Moment[]> {
  try {
    await ensureSharedStoreReady()
    return await requestJson<Moment[]>('/api/moments')
  } catch (error) {
    console.error('Failed to get all moments:', error)
    throw new Error('Failed to load moments')
  }
}

/**
 * Create a new moment
 * There is no duplicate-date check — unlimited moments per day
 * @param input Moment data (without id, timestamps)
 * @returns Created moment
 * @throws Error if validation fails
 */
export async function createMoment(input: CreateMomentInput): Promise<Moment> {
  const validation = validateMoment(input)
  if (!validation.valid) {
    throw new Error(validation.errors.map((e) => e.message).join(', '))
  }

  await ensureSharedStoreReady()
  return await requestJson<Moment>('/api/moments', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Update an existing moment
 * @param id Moment ID
 * @param updates Fields to update (including moment_date)
 * @returns Updated moment
 * @throws Error if moment not found or validation fails
 */
export async function updateMoment(
  id: string,
  updates: UpdateMomentInput
): Promise<Moment> {
  const validation = validateMoment(updates, true)
  if (!validation.valid) {
    throw new Error(validation.errors.map((e) => e.message).join(', '))
  }

  await ensureSharedStoreReady()
  return await requestJson<Moment>(`/api/moments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

/**
 * Delete a moment
 * @param id Moment ID
 * @throws Error if moment not found
 */
export async function deleteMoment(id: string): Promise<void> {
  await ensureSharedStoreReady()
  await requestJson<null>(`/api/moments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/**
 * Get count of total moments
 * @returns Number of moments
 */
export async function getMomentCount(): Promise<number> {
  try {
    const moments = await getAllMoments()
    return moments.length
  } catch (error) {
    console.error('Failed to get moment count:', error)
    return 0
  }
}
