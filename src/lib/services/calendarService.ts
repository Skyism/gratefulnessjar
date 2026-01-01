import type { Entry } from '@/types/entry'
import { Rating } from '@/types/rating'
import { getDatesInMonth } from './dateService'

/**
 * Calendar statistics for a given month
 */
export interface MonthStats {
  /** Total number of entries in the month */
  totalEntries: number
  /** Average rating across all entries (null if no entries) */
  averageRating: number | null
  /** Best day of the month with highest rating */
  bestDay: { date: string; rating: Rating } | null
  /** Percentage of days with entries (0-100) */
  completionRate: number
}

/**
 * Calculate statistics for entries in a given month
 * @param entries All entries to consider
 * @param year Year (e.g., 2024)
 * @param month Month (1-12)
 * @returns Month statistics
 */
export function calculateMonthStats(
  entries: Entry[],
  year: number,
  month: number
): MonthStats {
  // Get all dates in the month
  const datesInMonth = getDatesInMonth(year, month)
  const totalDaysInMonth = datesInMonth.length

  // Filter entries for this month
  const monthEntries = entries.filter((entry) =>
    datesInMonth.includes(entry.entry_date)
  )

  const totalEntries = monthEntries.length

  // Calculate average rating
  let averageRating: number | null = null
  if (totalEntries > 0) {
    const sumRatings = monthEntries.reduce((sum, entry) => sum + entry.rating, 0)
    averageRating = sumRatings / totalEntries
  }

  // Find best day (highest rating)
  let bestDay: { date: string; rating: Rating } | null = null
  if (totalEntries > 0) {
    const sorted = [...monthEntries].sort((a, b) => b.rating - a.rating)
    const best = sorted[0]
    bestDay = {
      date: best.entry_date,
      rating: best.rating,
    }
  }

  // Calculate completion rate
  const completionRate = totalDaysInMonth > 0
    ? Math.round((totalEntries / totalDaysInMonth) * 100)
    : 0

  return {
    totalEntries,
    averageRating,
    bestDay,
    completionRate,
  }
}

/**
 * Get a subtle emoji that represents a rating
 * Uses calm, journal-appropriate emojis
 * @param rating Rating value (1-7)
 * @returns Emoji string
 */
export function getRatingEmoji(rating: Rating): string {
  const emojiMap: Record<Rating, string> = {
    [Rating.NIGHTMARE]: '😞',
    [Rating.TERRIBLE]: '😔',
    [Rating.BAD]: '😕',
    [Rating.OK]: '😐',
    [Rating.GOOD]: '🙂',
    [Rating.GREAT]: '😊',
    [Rating.THE_BEST]: '✨',
  }

  return emojiMap[rating] || '·'
}
