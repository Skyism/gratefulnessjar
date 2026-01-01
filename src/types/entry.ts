import { Rating } from './rating'

/**
 * Entry interface representing a single gratitude journal entry
 * Stored in IndexedDB for offline-first functionality
 */
export interface Entry {
  /**
   * Unique identifier (UUID v4)
   */
  id: string

  /**
   * Entry date in YYYY-MM-DD format (local timezone)
   * This is the key for enforcing one entry per day
   * @example "2024-12-31"
   */
  entry_date: string

  /**
   * User's gratitude text
   * Min: 1 character, Max: 1000 characters
   */
  gratitude_text: string

  /**
   * Day rating (1-7 scale)
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
 * Partial entry for creating new entries
 * id, created_at, updated_at will be auto-generated
 */
export type CreateEntryInput = Omit<Entry, 'id' | 'created_at' | 'updated_at' | 'synced_at' | 'deleted'>

/**
 * Partial entry for updating existing entries
 * Only gratitude_text and rating can be updated
 */
export type UpdateEntryInput = Partial<Pick<Entry, 'gratitude_text' | 'rating'>>

/**
 * Entry validation error
 */
export interface EntryValidationError {
  field: keyof Entry
  message: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: EntryValidationError[]
}
