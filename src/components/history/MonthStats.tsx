import { useMemo } from 'react'
import type { Entry } from '@/types/entry'
import { calculateMonthStats } from '@/lib/services/calendarService'
import { RATING_LABELS } from '@/types/rating'
import { formatDateCompact } from '@/lib/services/dateService'
import { Calendar, Star, Trophy, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MonthStatsProps {
  entries: Entry[]
  year: number
  month: number
  className?: string
}

/**
 * MonthStats - Display statistics for a given month
 *
 * Shows:
 * - Total entries
 * - Average rating
 * - Best day
 * - Completion rate
 */
export function MonthStats({ entries, year, month, className }: MonthStatsProps) {
  const stats = useMemo(
    () => calculateMonthStats(entries, year, month),
    [entries, year, month]
  )

  // Empty state
  if (stats.totalEntries === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-sm text-stone-500 italic">
          No entries yet this month. Start writing to see your stats!
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
      {/* Total Entries */}
      <StatCard
        icon={<Calendar className="w-4 h-4" />}
        value={stats.totalEntries.toString()}
        label="Entries"
      />

      {/* Average Rating */}
      <StatCard
        icon={<Star className="w-4 h-4" />}
        value={stats.averageRating?.toFixed(1) || '-'}
        label="Avg Rating"
      />

      {/* Best Day */}
      <StatCard
        icon={<Trophy className="w-4 h-4" />}
        value={
          stats.bestDay
            ? `${formatDateCompact(stats.bestDay.date)}`
            : '-'
        }
        label={
          stats.bestDay
            ? RATING_LABELS[stats.bestDay.rating]
            : 'Best Day'
        }
      />

      {/* Completion Rate */}
      <StatCard
        icon={<Percent className="w-4 h-4" />}
        value={`${stats.completionRate}%`}
        label="Complete"
      />
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-md border border-stone-200 bg-stone-50">
      <div className="text-stone-500">{icon}</div>
      <div className="text-lg font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-600 text-center">{label}</div>
    </div>
  )
}
