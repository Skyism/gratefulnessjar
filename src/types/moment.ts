import { Rating } from './rating'

/**
 * Moment interface representing a memorable moment worth keeping
 * Stored in IndexedDB for offline-first functionality
 *
 * Unlike entries, there is no one-per-day limit — moment_date is not unique
 */
export interface Moment {
  /**
   * Unique identifier (UUID v4)
   */
  id: string

  /**
   * Moment date in YYYY-MM-DD format (local timezone)
   * NOT unique — multiple moments can share a date
   * @example "2024-12-31"
   */
  moment_date: string

  /**
   * Short title for the moment
   * Min: 1 character, Max: 100 characters
   */
  title: string

  /**
   * Longer description of the moment
   * Optional, Max: 1000 characters; blank values are normalized to undefined
   */
  description?: string

  /**
   * Happiness rating (1-7 scale, same as entries)
   */
  rating: Rating

  /**
   * Creation timestamp (Unix milliseconds)
   */
  created_at: number

  /**
   * Last update timestamp (Unix milliseconds)
   */
  updated_at: number

  /**
   * Last sync timestamp (Unix milliseconds)
   * Optional - only used if cloud sync is enabled
   */
  synced_at?: number

  /**
   * Soft delete flag for cloud sync
   * Optional - only used if cloud sync is enabled
   */
  deleted?: boolean
}

/**
 * Partial moment for creating new moments
 * id, created_at, updated_at will be auto-generated
 */
export type CreateMomentInput = Omit<Moment, 'id' | 'created_at' | 'updated_at' | 'synced_at' | 'deleted'>

/**
 * Partial moment for updating existing moments
 * moment_date IS editable (no uniqueness constraint to protect)
 */
export type UpdateMomentInput = Partial<Pick<Moment, 'title' | 'description' | 'rating' | 'moment_date'>>

/**
 * Moment validation error
 */
export interface MomentValidationError {
  field: keyof Moment
  message: string
}

/**
 * Moment validation result
 */
export interface MomentValidationResult {
  valid: boolean
  errors: MomentValidationError[]
}
