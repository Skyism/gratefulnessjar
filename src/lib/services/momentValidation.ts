import type {
  Moment,
  MomentValidationResult,
  MomentValidationError,
} from '@/types'
import { isValidDateString, isFuture } from './dateService'

export function validateMoment(
  data: Partial<Moment>,
  isUpdate: boolean = false
): MomentValidationResult {
  const errors: MomentValidationError[] = []

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

  if (data.description !== undefined && data.description.length > 1000) {
    errors.push({
      field: 'description',
      message: 'Description must be 1000 characters or less',
    })
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

  // Checked on updates too, since moment_date is editable
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
