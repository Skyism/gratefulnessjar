import { useState, useMemo } from 'react'
import type { Entry } from '@/types'
import { RATING_COLORS, RATING_LABELS } from '@/types'
import { getDatesInMonth, formatDateWithDay, getTodayDateString, parseEntryDate } from '@/lib/services/dateService'
import { getRatingEmoji } from '@/lib/services/calendarService'
import { Button } from '../ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card'
import { EntryPreviewCard } from './EntryPreviewCard'
import { MonthStats } from './MonthStats'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  entries: Entry[]
  onSelectDate: (dateString: string) => void
  selectedDate?: string | null
  className?: string
}

/**
 * CalendarView - Month grid calendar with color-coded entries
 *
 * Design: Clean calendar grid with sophisticated rating colors
 */
export function CalendarView({
  entries,
  onSelectDate,
  selectedDate,
  className,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1 // 1-12

  // Create entry map for quick lookups (memoized for performance)
  const entryMap = useMemo(() => {
    const map = new Map<string, Entry>()
    entries.forEach((entry) => {
      map.set(entry.entry_date, entry)
    })
    return map
  }, [entries])

  // Get all dates in the month
  const datesInMonth = getDatesInMonth(year, month)

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

  // Calculate padding days
  const paddingDays = firstDayOfMonth

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth() + 1

  return (
    <div className={cn('space-y-4', className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-stone-900">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center py-2 text-xs font-medium text-stone-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Padding days */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="aspect-square border-b border-r border-stone-100" />
          ))}

          {/* Month days */}
          {datesInMonth.map((dateString) => {
            const entry = entryMap.get(dateString)
            const isSelected = selectedDate === dateString
            const isToday = dateString === getTodayDateString()

            const day = parseEntryDate(dateString).getDate()

            // If entry exists, wrap in HoverCard for preview
            if (entry) {
              return (
                <HoverCard key={dateString} openDelay={300} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <button
                      onClick={() => onSelectDate(dateString)}
                      className={cn(
                        'aspect-square border-b border-r border-stone-100',
                        'relative p-1.5 sm:p-2',
                        'transition-all duration-200',
                        'hover:bg-stone-50',
                        'focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-inset',
                        'focus:z-10',
                        isSelected && 'ring-2 ring-amber-600 ring-inset bg-amber-50',
                        isToday && 'font-semibold'
                      )}
                      aria-label={`${formatDateWithDay(dateString)}, ${RATING_LABELS[entry.rating]}`}
                    >
                      {/* Day number */}
                      <div className="text-sm text-white relative z-10">
                        {day}
                      </div>

                      {/* Rating emoji indicator */}
                      <div className="absolute top-1 right-1 text-xs opacity-80 z-10">
                        {getRatingEmoji(entry.rating)}
                      </div>

                      {/* Entry indicator (color background) */}
                      <div
                        className="absolute inset-0 opacity-90"
                        style={{ backgroundColor: RATING_COLORS[entry.rating] }}
                      />

                      {/* Today indicator (white dot on colored background) */}
                      {isToday && (
                        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-white/80 z-10" />
                      )}
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent side="top" align="center" className="w-80 bg-white shadow-lg border-stone-300">
                    <EntryPreviewCard entry={entry} />
                  </HoverCardContent>
                </HoverCard>
              )
            }

            // Empty date (no entry)
            return (
              <button
                key={dateString}
                onClick={() => onSelectDate(dateString)}
                className={cn(
                  'aspect-square border-b border-r border-stone-100',
                  'relative p-1.5 sm:p-2',
                  'transition-all duration-200',
                  'group',
                  'hover:bg-stone-100/50',
                  'focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-inset',
                  'focus:z-10',
                  isSelected && 'ring-2 ring-amber-600 ring-inset bg-amber-50',
                  isToday && 'font-semibold'
                )}
                aria-label={formatDateWithDay(dateString)}
              >
                {/* Day number */}
                <div
                  className={cn(
                    'text-sm',
                    isToday ? 'text-amber-600' : 'text-stone-700'
                  )}
                >
                  {day}
                </div>

                {/* "+" indicator on hover for empty dates */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none">
                  <Plus className="w-4 h-4 text-stone-400" />
                </div>

                {/* Today indicator */}
                {isToday && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-600" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-600 items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-600" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-amber-600 rounded" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gradient-to-r from-stone-400 to-teal-600 rounded" />
          <span>Rated entry (hover to preview)</span>
        </div>
        <div className="text-stone-500 italic">
          Click any date to add or view entry
        </div>
      </div>

      {/* Month Statistics */}
      <MonthStats
        entries={entries}
        year={year}
        month={month}
        className="mt-2"
      />

      {/* Screen reader hint */}
      <div id="calendar-hint" className="sr-only">
        Hover to preview entry, click to view full details
      </div>
    </div>
  )
}
