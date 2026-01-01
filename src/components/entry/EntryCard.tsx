import type { Entry } from '@/types'
import { RatingBadge } from '../common/RatingSelector'
import { Card, CardContent } from '../ui/card'
import { formatDateWithDay, getRelativeTime } from '@/lib/services/dateService'
import { cn } from '@/lib/utils'

interface EntryCardProps {
  entry: Entry
  onClick?: () => void
  className?: string
}

/**
 * EntryCard - Display entry summary in list view
 *
 * Design: Clean card with rating badge and truncated text
 */
export function EntryCard({ entry, onClick, className }: EntryCardProps) {
  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-md hover:border-amber-600',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Rating badge */}
          <RatingBadge rating={entry.rating} size="md" showLabel={false} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <time className="text-sm font-medium text-stone-900">
                {formatDateWithDay(entry.entry_date)}
              </time>
              <span className="text-xs text-stone-500 font-mono whitespace-nowrap">
                {getRelativeTime(entry.entry_date)}
              </span>
            </div>
            <p className="text-sm text-stone-700 font-serif leading-relaxed line-clamp-2">
              {entry.gratitude_text}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
