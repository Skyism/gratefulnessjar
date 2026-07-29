import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/schema'
import type {
  Moment,
  CreateMomentInput,
  UpdateMomentInput,
  MomentValidationResult,
  MomentValidationError,
} from '@/types'
import { isValidDateString, isFuture } from './dateService'

/**
 * Moment Service - Business logic for "moments to remember" CRUD operations
 *
 * Unlike entries, moments have no one-per-day limit — any number of
 * moments can share a date, and moment_date is editable
 */

/**
 * Sort moments newest first, tiebreaking same-day moments by creation time
 * (needed because multiple moments can share a moment_date)
 */
function sortMoments(moments: Moment[]): Moment[] {
  return moments.sort(
    (a, b) =>
      b.moment_date.localeCompare(a.moment_date) || b.created_at - a.created_at
  )
}

/**
 * Validate moment data
 * @param data Moment data to validate
 * @param isUpdate Whether this is an update (some fields optional)
 * @returns Validation result with errors
 */
export function validateMoment(
  data: Partial<Moment>,
  isUpdate: boolean = false
): MomentValidationResult {
  const errors: MomentValidationError[] = []

  // Validate title
  if (!isUpdate || data.title !== undefined) {
    const title = data.title || ''
    if (title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Title is required',
      })
    } else if (title.length > 100) {
      errors.push({
        field: 'title',
        message: 'Title must be 100 characters or less',
      })
    }
  }

  // Validate description (optional)
  if (data.description !== undefined && data.description.length > 1000) {
    errors.push({
      field: 'description',
      message: 'Description must be 1000 characters or less',
    })
  }

  // Validate rating
  if (!isUpdate || data.rating !== undefined) {
    if (data.rating === undefined || data.rating === null) {
      errors.push({
        field: 'rating',
        message: 'Rating is required',
      })
    } else if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 7) {
      errors.push({
        field: 'rating',
        message: 'Rating must be a whole number between 1 and 7',
      })
    }
  }

  // Validate moment_date (checked on updates too, since the date is editable)
  if (!isUpdate || data.moment_date !== undefined) {
    const dateString = data.moment_date || ''
    if (!isValidDateString(dateString)) {
      errors.push({
        field: 'moment_date',
        message: 'Invalid date format (use YYYY-MM-DD)',
      })
    } else if (isFuture(dateString)) {
      errors.push({
        field: 'moment_date',
        message: 'Cannot create moments for future dates',
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get moment by ID
 * @param id Moment ID
 * @returns Moment or null if not found
 */
export async function getMomentById(id: string): Promise<Moment | null> {
  try {
    const moment = await db.moments.get(id)
    return moment || null
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
    const moments = await db.moments.toArray()
    return sortMoments(moments)
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
  // Validate input
  const validation = validateMoment(input)
  if (!validation.valid) {
    throw new Error(
      validation.errors.map((e) => e.message).join(', ')
    )
  }

  // Create moment (blank description is normalized to undefined)
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

  try {
    await db.moments.add(moment)
    return moment
  } catch (error) {
    console.error('Failed to create moment:', error)
    throw new Error('Failed to save moment')
  }
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
  // Validate updates
  const validation = validateMoment(updates, true)
  if (!validation.valid) {
    throw new Error(
      validation.errors.map((e) => e.message).join(', ')
    )
  }

  // Get existing moment
  const existing = await getMomentById(id)
  if (!existing) {
    throw new Error('Moment not found')
  }

  // Prepare updates (blank description is normalized to undefined)
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

  try {
    await db.moments.put(updatedMoment)
    return updatedMoment
  } catch (error) {
    console.error('Failed to update moment:', error)
    throw new Error('Failed to update moment')
  }
}

/**
 * Delete a moment
 * @param id Moment ID
 * @throws Error if moment not found
 */
export async function deleteMoment(id: string): Promise<void> {
  const existing = await getMomentById(id)
  if (!existing) {
    throw new Error('Moment not found')
  }

  try {
    await db.moments.delete(id)
  } catch (error) {
    console.error('Failed to delete moment:', error)
    throw new Error('Failed to delete moment')
  }
}

/**
 * Get count of total moments
 * @returns Number of moments
 */
export async function getMomentCount(): Promise<number> {
  try {
    return await db.moments.count()
  } catch (error) {
    console.error('Failed to get moment count:', error)
    return 0
  }
}
