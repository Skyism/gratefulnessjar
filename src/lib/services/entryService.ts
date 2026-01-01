import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/schema'
import type {
  Entry,
  CreateEntryInput,
  UpdateEntryInput,
  ValidationResult,
  EntryValidationError,
} from '@/types'
import { getTodayDateString, isValidDateString, isFuture } from './dateService'

/**
 * Entry Service - Business logic for entry CRUD operations
 *
 * All operations are async and return Promises
 * Validates input before database operations
 */

/**
 * Validate entry data
 * @param data Entry data to validate
 * @param isUpdate Whether this is an update (some fields optional)
 * @returns Validation result with errors
 */
export function validateEntry(
  data: Partial<Entry>,
  isUpdate: boolean = false
): ValidationResult {
  const errors: EntryValidationError[] = []

  // Validate gratitude_text
  if (!isUpdate || data.gratitude_text !== undefined) {
    const text = data.gratitude_text || ''
    if (text.trim().length === 0) {
      errors.push({
        field: 'gratitude_text',
        message: 'Gratitude text is required',
      })
    } else if (text.length > 1000) {
      errors.push({
        field: 'gratitude_text',
        message: 'Gratitude text must be 1000 characters or less',
      })
    }
  }

  // Validate rating
  if (!isUpdate || data.rating !== undefined) {
    if (data.rating === undefined || data.rating === null) {
      errors.push({
        field: 'rating',
        message: 'Rating is required',
      })
    } else if (data.rating < 1 || data.rating > 7) {
      errors.push({
        field: 'rating',
        message: 'Rating must be between 1 and 7',
      })
    }
  }

  // Validate entry_date
  if (!isUpdate && data.entry_date) {
    if (!isValidDateString(data.entry_date)) {
      errors.push({
        field: 'entry_date',
        message: 'Invalid date format (use YYYY-MM-DD)',
      })
    } else if (isFuture(data.entry_date)) {
      errors.push({
        field: 'entry_date',
        message: 'Cannot create entries for future dates',
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get today's entry (if it exists)
 * @returns Entry or null if no entry for today
 */
export async function getTodayEntry(): Promise<Entry | null> {
  try {
    const today = getTodayDateString()
    const entry = await db.entries.where('entry_date').equals(today).first()
    return entry || null
  } catch (error) {
    console.error('Failed to get today\'s entry:', error)
    throw new Error('Failed to load today\'s entry')
  }
}

/**
 * Get entry by date
 * @param dateString Date string (YYYY-MM-DD)
 * @returns Entry or null if not found
 */
export async function getEntryByDate(dateString: string): Promise<Entry | null> {
  try {
    const entry = await db.entries.where('entry_date').equals(dateString).first()
    return entry || null
  } catch (error) {
    console.error('Failed to get entry by date:', error)
    throw new Error(`Failed to load entry for ${dateString}`)
  }
}

/**
 * Get entry by ID
 * @param id Entry ID
 * @returns Entry or null if not found
 */
export async function getEntryById(id: string): Promise<Entry | null> {
  try {
    const entry = await db.entries.get(id)
    return entry || null
  } catch (error) {
    console.error('Failed to get entry by ID:', error)
    throw new Error(`Failed to load entry ${id}`)
  }
}

/**
 * Get all entries, sorted by date (newest first)
 * @returns Array of entries
 */
export async function getAllEntries(): Promise<Entry[]> {
  try {
    const entries = await db.entries
      .orderBy('entry_date')
      .reverse()
      .toArray()
    return entries
  } catch (error) {
    console.error('Failed to get all entries:', error)
    throw new Error('Failed to load entries')
  }
}

/**
 * Get entries in a date range
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Array of entries
 */
export async function getEntriesInRange(
  startDate: string,
  endDate: string
): Promise<Entry[]> {
  try {
    const entries = await db.entries
      .where('entry_date')
      .between(startDate, endDate, true, true)
      .toArray()
    return entries.sort((a, b) => b.entry_date.localeCompare(a.entry_date))
  } catch (error) {
    console.error('Failed to get entries in range:', error)
    throw new Error('Failed to load entries')
  }
}

/**
 * Create a new entry
 * @param input Entry data (without id, timestamps)
 * @returns Created entry
 * @throws Error if validation fails or entry already exists for this date
 */
export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  // Validate input
  const validation = validateEntry(input)
  if (!validation.valid) {
    throw new Error(
      validation.errors.map((e) => e.message).join(', ')
    )
  }

  // Check if entry already exists for this date
  const existing = await getEntryByDate(input.entry_date)
  if (existing) {
    throw new Error(
      `An entry already exists for ${input.entry_date}. Please edit the existing entry instead.`
    )
  }

  // Create entry
  const now = Date.now()
  const entry: Entry = {
    id: uuidv4(),
    entry_date: input.entry_date,
    gratitude_text: input.gratitude_text.trim(),
    rating: input.rating,
    created_at: now,
    updated_at: now,
  }

  try {
    await db.entries.add(entry)
    return entry
  } catch (error) {
    console.error('Failed to create entry:', error)
    if (error instanceof Error && error.message.includes('constraint')) {
      throw new Error(
        'An entry already exists for this date. Please edit the existing entry instead.'
      )
    }
    throw new Error('Failed to save entry')
  }
}

/**
 * Create entry for today
 * @param input Entry data (entry_date will be set to today)
 * @returns Created entry
 */
export async function createTodayEntry(
  input: Omit<CreateEntryInput, 'entry_date'>
): Promise<Entry> {
  return createEntry({
    ...input,
    entry_date: getTodayDateString(),
  })
}

/**
 * Update an existing entry
 * @param id Entry ID
 * @param updates Fields to update
 * @returns Updated entry
 * @throws Error if entry not found or validation fails
 */
export async function updateEntry(
  id: string,
  updates: UpdateEntryInput
): Promise<Entry> {
  // Validate updates
  const validation = validateEntry(updates, true)
  if (!validation.valid) {
    throw new Error(
      validation.errors.map((e) => e.message).join(', ')
    )
  }

  // Get existing entry
  const existing = await getEntryById(id)
  if (!existing) {
    throw new Error('Entry not found')
  }

  // Prepare updates
  const updatedEntry: Entry = {
    ...existing,
    ...updates,
    gratitude_text: updates.gratitude_text?.trim() ?? existing.gratitude_text,
    updated_at: Date.now(),
  }

  try {
    await db.entries.update(id, updatedEntry)
    return updatedEntry
  } catch (error) {
    console.error('Failed to update entry:', error)
    throw new Error('Failed to update entry')
  }
}

/**
 * Delete an entry
 * @param id Entry ID
 * @throws Error if entry not found
 */
export async function deleteEntry(id: string): Promise<void> {
  const existing = await getEntryById(id)
  if (!existing) {
    throw new Error('Entry not found')
  }

  try {
    await db.entries.delete(id)
  } catch (error) {
    console.error('Failed to delete entry:', error)
    throw new Error('Failed to delete entry')
  }
}

/**
 * Get count of total entries
 * @returns Number of entries
 */
export async function getEntryCount(): Promise<number> {
  try {
    return await db.entries.count()
  } catch (error) {
    console.error('Failed to get entry count:', error)
    return 0
  }
}

/**
 * Get a random entry (excluding today)
 * Useful for "jar mode" feature
 * @returns Random entry or null if no entries
 */
export async function getRandomEntry(): Promise<Entry | null> {
  try {
    const today = getTodayDateString()
    const entries = await db.entries
      .where('entry_date')
      .notEqual(today)
      .toArray()

    if (entries.length === 0) {
      return null
    }

    const randomIndex = Math.floor(Math.random() * entries.length)
    return entries[randomIndex]
  } catch (error) {
    console.error('Failed to get random entry:', error)
    return null
  }
}

/**
 * Search entries by text
 * @param query Search query
 * @returns Array of matching entries
 */
export async function searchEntries(query: string): Promise<Entry[]> {
  try {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) {
      return []
    }

    const allEntries = await getAllEntries()
    return allEntries.filter((entry) =>
      entry.gratitude_text.toLowerCase().includes(normalizedQuery)
    )
  } catch (error) {
    console.error('Failed to search entries:', error)
    return []
  }
}
