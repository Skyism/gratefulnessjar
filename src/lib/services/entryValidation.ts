import type {
  Entry,
  ValidationResult,
  EntryValidationError,
} from '@/types'
import { isFuture, isValidDateString } from './dateService'

export function validateEntry(
  data: Partial<Entry>,
  isUpdate: boolean = false
): ValidationResult {
  const errors: EntryValidationError[] = []

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
