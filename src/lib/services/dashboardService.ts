import type { Entry } from '@/types/entry'
import { Rating, RATING_COLORS, RATING_LABELS } from '@/types/rating'
import { getTodayDateString, getDateString, parseEntryDate, formatDateCompact } from './dateService'

/**
 * Calculate the current streak (consecutive days with entries from today backward)
 * @param entries All entries
 * @returns Streak count (0 if no entry today or no entries)
 */
export function calculateStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0

  // Create a Set of all entry dates for O(1) lookup
  const entryDates = new Set(entries.map((e) => e.entry_date))

  // Get today's date
  let currentDate = getTodayDateString()
  let streak = 0

  // Check if there's an entry today - if not, streak is 0
  if (!entryDates.has(currentDate)) {
    return 0
  }

  // Walk backwards day by day
  while (entryDates.has(currentDate)) {
    streak++
    // Get previous day
    const date = parseEntryDate(currentDate)
    const previousDay = new Date(date)
    previousDay.setDate(previousDay.getDate() - 1)
    currentDate = getDateString(previousDay)
  }

  return streak
}

/**
 * Calculate average rating across all entries
 * @param entries All entries
 * @returns Average rating or null if no entries
 */
export function calculateAverageRating(entries: Entry[]): number | null {
  if (entries.length === 0) return null

  const sum = entries.reduce((acc, entry) => acc + entry.rating, 0)
  return sum / entries.length
}

/**
 * Get rating distribution for pie chart
 * @param entries All entries
 * @returns Array of rating counts with labels and colors
 */
export function getRatingDistribution(
  entries: Entry[]
): Array<{
  rating: number
  label: string
  count: number
  percentage: number
  fill: string
}> {
  if (entries.length === 0) return []

  // Count occurrences of each rating
  const counts = new Map<Rating, number>()
  entries.forEach((entry) => {
    counts.set(entry.rating, (counts.get(entry.rating) || 0) + 1)
  })

  // Convert to array with all rating info
  const distribution = Array.from(counts.entries())
    .map(([rating, count]) => ({
      rating,
      label: RATING_LABELS[rating],
      count,
      percentage: Math.round((count / entries.length) * 100),
      fill: RATING_COLORS[rating],
    }))
    .sort((a, b) => a.rating - b.rating) // Sort by rating value

  return distribution
}

/**
 * Get entries per month for bar chart
 * @param entries All entries
 * @returns Array of month counts
 */
export function getEntriesPerMonth(
  entries: Entry[]
): Array<{
  month: string
  count: number
  year: number
  monthIndex: number
}> {
  if (entries.length === 0) return []

  // Group by YYYY-MM
  const monthCounts = new Map<string, number>()
  entries.forEach((entry) => {
    const yearMonth = entry.entry_date.substring(0, 7) // YYYY-MM
    monthCounts.set(yearMonth, (monthCounts.get(yearMonth) || 0) + 1)
  })

  // Convert to array with formatted month names
  const monthData = Array.from(monthCounts.entries())
    .map(([yearMonth, count]) => {
      const [year, month] = yearMonth.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return {
        month: date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        count,
        year: parseInt(year),
        monthIndex: parseInt(month),
      }
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.monthIndex - b.monthIndex
    })

  return monthData
}

/**
 * Get rating over time for area chart
 * @param entries All entries
 * @returns Array of date/rating pairs sorted chronologically
 */
export function getRatingOverTime(
  entries: Entry[]
): Array<{
  date: string
  rating: number
  formattedDate: string
}> {
  if (entries.length === 0) return []

  // Sort entries chronologically
  const sorted = [...entries].sort((a, b) => {
    return a.entry_date.localeCompare(b.entry_date)
  })

  // Map to chart data
  return sorted.map((entry) => ({
    date: entry.entry_date,
    rating: entry.rating,
    formattedDate: formatDateCompact(entry.entry_date),
  }))
}
