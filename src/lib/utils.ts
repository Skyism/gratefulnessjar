import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncate text to a maximum length, breaking at word boundaries
 * @param text Text to truncate
 * @param maxLength Maximum length (default: 150)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text

  // Find last space before maxLength to avoid cutting words
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}
