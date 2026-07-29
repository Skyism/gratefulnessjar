import { useState, useMemo } from 'react'
import type { Entry } from '@/types'
import { RATING_COLORS, RATING_LABELS } from '@/types'
import { getDatesInMonth, formatDateWithDay, getTodayDateString, parseEntryDate, isFuture } from '@/lib/services/dateService'
import { getRatingEmoji } from '@/lib/services/calendarService'
import { Button } from '../ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card'
import { EntryPreviewCard } from './EntryPreviewCard'
import { MonthStats } from './MonthStats'
import { AddEntryDialog } from '../entry/AddEntryDialog'
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
  const [addEntryDialogOpen, setAddEntryDialogOpen] = useState(false)
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<string | null>(null)

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
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              Today
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-stone-50/30 rounded-xl p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center py-2 text-xs font-semibold text-stone-500 tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Padding days */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="aspect-square" />
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
                        'aspect-square rounded-xl',
                        'relative p-2',
                        'transition-all duration-300',
                        'shadow-md hover:shadow-xl hover:scale-105',
                        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                        'focus:z-10',
                        isSelected && 'ring-2 ring-amber-500 ring-offset-2 scale-105',
                        isToday && 'font-bold ring-2 ring-amber-400 ring-offset-2'
                      )}
                      aria-label={`${formatDateWithDay(dateString)}, ${RATING_LABELS[entry.rating]}`}
                    >
                      {/* Day number */}
                      <div className="text-sm text-white relative z-10 font-medium">
                        {day}
                      </div>

                      {/* Rating emoji indicator */}
                      <div className="absolute top-1.5 right-1.5 text-base opacity-90 z-10">
                        {getRatingEmoji(entry.rating)}
                      </div>

                      {/* Entry indicator (color background) */}
                      <div
                        className="absolute inset-0 rounded-xl"
                        style={{ backgroundColor: RATING_COLORS[entry.rating] }}
                      />

                      {/* Today indicator (white dot on colored background) */}
                      {isToday && (
                        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-white shadow-sm z-10" />
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
            const isFutureDate = isFuture(dateString)

            return (
              <button
                key={dateString}
                onClick={() => {
                  if (!isFutureDate) {
                    // Open dialog to add entry for past/today dates
                    setSelectedDateForAdd(dateString)
                    setAddEntryDialogOpen(true)
                  } else {
                    // Just select future dates (no entry creation)
                    onSelectDate(dateString)
                  }
                }}
                className={cn(
                  'aspect-square rounded-xl',
                  'relative p-2',
                  'transition-all duration-300',
                  'group',
                  isFutureDate
                    ? 'bg-stone-100 cursor-not-allowed opacity-50'
                    : 'bg-white/80 hover:bg-white cursor-pointer shadow-sm hover:shadow-md hover:scale-105',
                  'border border-stone-200/50 hover:border-stone-300',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                  'focus:z-10',
                  isSelected && 'ring-2 ring-amber-500 ring-offset-2 scale-105 bg-amber-50',
                  isToday && 'font-bold border-amber-400 ring-2 ring-amber-400 ring-offset-2'
                )}
                disabled={isFutureDate}
                aria-label={formatDateWithDay(dateString)}
              >
                {/* Day number */}
                <div
                  className={cn(
                    'text-sm font-medium relative z-10',
                    isToday ? 'text-amber-600' : 'text-stone-700'
                  )}
                >
                  {day}
                </div>

                {/* "+" indicator on hover for empty dates */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <Plus className="w-5 h-5 text-stone-500" />
                </div>

                {/* Today indicator */}
                {isToday && (
                  <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-stone-600 items-center">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm" />
          <span className="font-medium">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-md border-2 border-amber-500 bg-white shadow-sm" />
          <span className="font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-gradient-to-br from-stone-500 to-teal-600 rounded-md shadow-sm" />
          <span className="font-medium">Entry (hover for preview)</span>
        </div>
        <div className="text-stone-500 italic text-xs">
          Click past dates to add entries • Hover to preview
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
        Hover to preview entry, click to view full details or add new entry
      </div>

      {/* Add Entry Dialog */}
      {selectedDateForAdd && (
        <AddEntryDialog
          open={addEntryDialogOpen}
          onOpenChange={setAddEntryDialogOpen}
          dateString={selectedDateForAdd}
          onSuccess={() => {
            setAddEntryDialogOpen(false)
          }}
        />
      )}
    </div>
  )
}
