import type { Entry } from '@/types/entry'
import { RatingBadge } from '@/components/common/RatingSelector'
import { formatDateWithDay } from '@/lib/services/dateService'
import { truncateText } from '@/lib/utils'
import { getRatingEmoji } from '@/lib/services/calendarService'
import { ArrowRight } from 'lucide-react'

interface EntryPreviewCardProps {
  entry: Entry
}

/**
 * EntryPreviewCard - Preview card for HoverCard content
 *
 * Displays a compact preview of an entry with:
 * - Formatted date with day name
 * - Rating badge with emoji
 * - Truncated gratitude text
 * - "Click to view" hint
 */
export function EntryPreviewCard({ entry }: EntryPreviewCardProps) {
  return (
    <div className="space-y-3">
      {/* Date header */}
      <div className="text-xs text-stone-600 font-medium">
        {formatDateWithDay(entry.entry_date)}
      </div>

      {/* Rating section */}
      <div className="flex items-center gap-2">
        <RatingBadge rating={entry.rating} size="sm" showLabel={true} />
        <span className="text-sm opacity-70">{getRatingEmoji(entry.rating)}</span>
      </div>

      {/* Preview text */}
      <p className="text-sm text-stone-700 leading-relaxed">
        {truncateText(entry.gratitude_text, 150)}
      </p>

      {/* Footer hint */}
      <div className="flex items-center gap-1 text-xs text-stone-400 pt-1">
        <span>Click to view full entry</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  )
}
