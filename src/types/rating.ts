/**
 * Rating enum for day quality (1-7 scale)
 * Uses numeric values for easy storage and comparison
 */
export enum Rating {
  NIGHTMARE = 1,
  TERRIBLE = 2,
  BAD = 3,
  OK = 4,
  GOOD = 5,
  GREAT = 6,
  THE_BEST = 7,
}

/**
 * Human-readable labels for each rating
 */
export const RATING_LABELS: Record<Rating, string> = {
  [Rating.NIGHTMARE]: 'Nightmare',
  [Rating.TERRIBLE]: 'Terrible',
  [Rating.BAD]: 'Bad',
  [Rating.OK]: 'OK',
  [Rating.GOOD]: 'Good',
  [Rating.GREAT]: 'Great',
  [Rating.THE_BEST]: 'The Best',
}

/**
 * Color palette for ratings - sophisticated, muted tones
 * Matches the design philosophy: calm, elegant, journal-like
 */
export const RATING_COLORS: Record<Rating, string> = {
  [Rating.NIGHTMARE]: '#3f3f46',  // charcoal gray
  [Rating.TERRIBLE]: '#9f1239',   // muted burgundy
  [Rating.BAD]: '#c2410c',        // warm terracotta
  [Rating.OK]: '#ca8a04',         // warm sand
  [Rating.GOOD]: '#4d7c0f',       // soft sage
  [Rating.GREAT]: '#15803d',      // forest green
  [Rating.THE_BEST]: '#0f766e',   // deep teal
}

/**
 * Lighter versions of rating colors for backgrounds
 */
export const RATING_BG_COLORS: Record<Rating, string> = {
  [Rating.NIGHTMARE]: '#f4f4f5',  // very light gray
  [Rating.TERRIBLE]: '#fef2f2',   // very light red
  [Rating.BAD]: '#fff7ed',        // very light orange
  [Rating.OK]: '#fefce8',         // very light yellow
  [Rating.GOOD]: '#f7fee7',       // very light lime
  [Rating.GREAT]: '#f0fdf4',      // very light green
  [Rating.THE_BEST]: '#f0fdfa',   // very light teal
}

/**
 * Helper function to get rating from numeric value
 */
export function getRatingFromValue(value: number): Rating | null {
  if (value < 1 || value > 7) return null
  return value as Rating
}

/**
 * Helper function to get all ratings in order
 */
export function getAllRatings(): Rating[] {
  return [
    Rating.NIGHTMARE,
    Rating.TERRIBLE,
    Rating.BAD,
    Rating.OK,
    Rating.GOOD,
    Rating.GREAT,
    Rating.THE_BEST,
  ]
}
