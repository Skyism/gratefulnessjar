import type { Moment } from '@/types'
import { RatingBadge } from '../common/RatingSelector'
import { Card, CardContent } from '../ui/card'
import { formatDateWithDay, getRelativeTime } from '@/lib/services/dateService'
import { cn } from '@/lib/utils'

interface MomentCardProps {
  moment: Moment
  onClick?: () => void
  className?: string
}

/**
 * MomentCard - Display moment summary in list view
 *
 * Design: Mirrors EntryCard — rating badge, title, date, truncated description
 */
export function MomentCard({ moment, onClick, className }: MomentCardProps) {
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
          <RatingBadge rating={moment.rating} size="md" showLabel={false} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className="text-sm font-medium text-stone-900 truncate">
                {moment.title}
              </h3>
              <span className="text-xs text-stone-500 font-mono whitespace-nowrap">
                {getRelativeTime(moment.moment_date)}
              </span>
            </div>
            <time className="block text-xs text-stone-500 mb-1">
              {formatDateWithDay(moment.moment_date)}
            </time>
            {moment.description && (
              <p className="text-sm text-stone-700 font-serif leading-relaxed line-clamp-2">
                {moment.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
