import { format, startOfDay, parseISO, isValid, differenceInDays } from 'date-fns'

/**
 * Date Service - Timezone-aware date utilities
 *
 * Key principle: Store dates in user's LOCAL timezone (YYYY-MM-DD)
 * This ensures "today" always means the calendar date in the user's current location
 */

/**
 * Get today's date string in YYYY-MM-DD format (local timezone)
 * @returns Date string like "2024-12-31"
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Get date string for any Date object in YYYY-MM-DD format (local timezone)
 * @param date Date object to convert
 * @returns Date string like "2024-12-31"
 */
export function getDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parse date string (YYYY-MM-DD) to Date object (start of day in local timezone)
 * @param dateString Date string like "2024-12-31"
 * @returns Date object at 00:00:00 local time
 */
export function parseEntryDate(dateString: string): Date {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) {
      throw new Error(`Invalid date string: ${dateString}`)
    }
    return startOfDay(date)
  } catch (error) {
    throw new Error(`Failed to parse date string: ${dateString}`)
  }
}

/**
 * Format date string for display
 * @param dateString Date string like "2024-12-31"
 * @param formatString Format string (date-fns format)
 * @returns Formatted date like "December 31, 2024"
 */
export function formatDateString(
  dateString: string,
  formatString: string = 'MMMM d, yyyy'
): string {
  try {
    const date = parseEntryDate(dateString)
    return format(date, formatString)
  } catch (error) {
    return dateString // Fallback to original string if parsing fails
  }
}

/**
 * Format date for display in compact form
 * @param dateString Date string like "2024-12-31"
 * @returns Formatted date like "Dec 31"
 */
export function formatDateCompact(dateString: string): string {
  return formatDateString(dateString, 'MMM d')
}

/**
 * Format date for display with day of week
 * @param dateString Date string like "2024-12-31"
 * @returns Formatted date like "Tuesday, December 31"
 */
export function formatDateWithDay(dateString: string): string {
  return formatDateString(dateString, 'EEEE, MMMM d')
}

/**
 * Check if a date string is today
 * @param dateString Date string like "2024-12-31"
 * @returns True if date is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString()
}

/**
 * Check if a date string is in the future
 * @param dateString Date string like "2024-12-31"
 * @returns True if date is in the future
 */
export function isFuture(dateString: string): boolean {
  try {
    const date = parseEntryDate(dateString)
    const today = startOfDay(new Date())
    return date > today
  } catch (error) {
    return false
  }
}

/**
 * Get number of days between two date strings
 * @param dateString1 First date string
 * @param dateString2 Second date string
 * @returns Number of days (can be negative)
 */
export function getDaysBetween(dateString1: string, dateString2: string): number {
  try {
    const date1 = parseEntryDate(dateString1)
    const date2 = parseEntryDate(dateString2)
    return differenceInDays(date2, date1)
  } catch (error) {
    return 0
  }
}

/**
 * Get relative time string (e.g., "today", "yesterday", "3 days ago")
 * @param dateString Date string like "2024-12-31"
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = parseEntryDate(dateString)
    const today = startOfDay(new Date())
    const days = differenceInDays(today, date)

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days === -1) return 'Tomorrow'
    if (days < 0) return `In ${Math.abs(days)} days`
    if (days < 7) return `${days} days ago`
    if (days < 30) {
      const weeks = Math.floor(days / 7)
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    }
    if (days < 365) {
      const months = Math.floor(days / 30)
      return months === 1 ? '1 month ago' : `${months} months ago`
    }
    const years = Math.floor(days / 365)
    return years === 1 ? '1 year ago' : `${years} years ago`
  } catch (error) {
    return dateString
  }
}

/**
 * Validate date string format (YYYY-MM-DD)
 * @param dateString Date string to validate
 * @returns True if valid
 */
export function isValidDateString(dateString: string): boolean {
  try {
    const date = parseISO(dateString)
    return isValid(date) && /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  } catch (error) {
    return false
  }
}

/**
 * Get start and end date strings for current month
 * @returns Object with start and end date strings
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    start: getDateString(start),
    end: getDateString(end),
  }
}

/**
 * Get all date strings in a month
 * @param year Year (e.g., 2024)
 * @param month Month (1-12)
 * @returns Array of date strings
 */
export function getDatesInMonth(year: number, month: number): string[] {
  const dates: string[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    dates.push(getDateString(date))
  }

  return dates
}
