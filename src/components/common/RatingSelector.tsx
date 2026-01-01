import { Rating, RATING_LABELS, RATING_COLORS, getAllRatings } from '@/types'
import { cn } from '@/lib/utils'

interface RatingSelectorProps {
  value: Rating | null
  onChange: (rating: Rating) => void
  disabled?: boolean
  className?: string
}

/**
 * RatingSelector - Sophisticated rating selector with muted colors
 *
 * Design: Horizontal button group with subtle colors and smooth interactions
 * No loud colors, no excessive rounding - refined and elegant
 */
export function RatingSelector({
  value,
  onChange,
  disabled = false,
  className,
}: RatingSelectorProps) {
  const ratings = getAllRatings()

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-stone-700">
        How was your day?
      </label>
      <div className="grid grid-cols-7 gap-1.5">
        {ratings.map((rating) => {
          const isSelected = value === rating
          const color = RATING_COLORS[rating]

          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-md',
                'transition-all duration-200',
                'border border-stone-200',
                'hover:scale-105 hover:shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-1',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'bg-white shadow-md border-2'
                  : 'bg-stone-50 hover:bg-white'
              )}
              style={{
                borderColor: isSelected ? color : undefined,
              }}
              aria-label={RATING_LABELS[rating]}
              aria-pressed={isSelected}
            >
              {/* Color indicator */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full mb-1.5',
                  'transition-transform duration-200',
                  isSelected && 'scale-110'
                )}
                style={{ backgroundColor: color }}
              />

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] font-medium text-center leading-tight',
                  isSelected ? 'text-stone-900' : 'text-stone-600'
                )}
              >
                {RATING_LABELS[rating]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Mobile-friendly stacked version for very small screens */}
      <div className="md:hidden grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ratings.map((rating) => {
          const isSelected = value === rating
          const color = RATING_COLORS[rating]

          return (
            <button
              key={`mobile-${rating}`}
              type="button"
              onClick={() => onChange(rating)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-3 p-3 rounded-md',
                'transition-all duration-200',
                'border border-stone-200',
                'hover:shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-1',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected
                  ? 'bg-white shadow-md border-2'
                  : 'bg-stone-50 hover:bg-white'
              )}
              style={{
                borderColor: isSelected ? color : undefined,
              }}
              aria-label={RATING_LABELS[rating]}
              aria-pressed={isSelected}
            >
              {/* Color indicator */}
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />

              {/* Label */}
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-stone-900' : 'text-stone-600'
                )}
              >
                {RATING_LABELS[rating]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Compact rating display (for showing rating in cards/lists)
 */
interface RatingBadgeProps {
  rating: Rating
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function RatingBadge({
  rating,
  size = 'md',
  showLabel = true,
  className,
}: RatingBadgeProps) {
  const color = RATING_COLORS[rating]
  const label = RATING_LABELS[rating]

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn('rounded-full flex-shrink-0', sizeClasses[size])}
        style={{ backgroundColor: color }}
        aria-label={label}
      />
      {showLabel && (
        <span className={cn('font-medium text-stone-700', textSizeClasses[size])}>
          {label}
        </span>
      )}
    </div>
  )
}
