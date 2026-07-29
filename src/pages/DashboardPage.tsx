import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '@/hooks/useEntries'
import {
  calculateStreak,
  calculateAverageRating,
  getRatingDistribution,
  getRatingOverTime,
  getEntriesPerMonth,
} from '@/lib/services/dashboardService'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RatingOverTimeChart } from '@/components/dashboard/RatingOverTimeChart'
import { RatingDistributionChart } from '@/components/dashboard/RatingDistributionChart'
import { EntriesPerMonthChart } from '@/components/dashboard/EntriesPerMonthChart'
import { RandomNoteCard } from '@/components/dashboard/RandomNoteCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flame, FileText, Star, BarChart3 } from 'lucide-react'

/**
 * DashboardPage - Comprehensive statistics and charts page
 */
export function DashboardPage() {
  const { entries, isLoading } = useEntries()
  const navigate = useNavigate()

  // Calculate all metrics (memoized for performance)
  const stats = useMemo(() => {
    const streak = calculateStreak(entries)
    const avgRating = calculateAverageRating(entries)
    const ratingDistribution = getRatingDistribution(entries)
    const ratingOverTime = getRatingOverTime(entries)
    const entriesPerMonth = getEntriesPerMonth(entries)

    return {
      streak,
      avgRating,
      ratingDistribution,
      ratingOverTime,
      entriesPerMonth,
    }
  }, [entries])

  // Empty state when no entries exist
  if (!isLoading && entries.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-stone-600 mt-2">
            Your gratitude journey at a glance
          </p>
        </div>

        <Card>
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-stone-900">
                No data yet
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Start writing entries to see your statistics, trends, and
                insights. Your gratitude journey begins with the first entry!
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="mt-4">
              Write your first entry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
          Dashboard
        </h1>
        <p className="text-stone-600 mt-2">
          Your gratitude journey at a glance
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Flame}
          value={stats.streak}
          label="Current Streak"
          iconColor="text-orange-500"
        />
        <MetricCard
          icon={FileText}
          value={entries.length}
          label="Total Entries"
          iconColor="text-stone-600"
        />
        <MetricCard
          icon={Star}
          value={stats.avgRating?.toFixed(1) ?? '-'}
          label="Average Rating"
          iconColor="text-amber-600"
        />
        <RandomNoteCard />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RatingOverTimeChart data={stats.ratingOverTime} />
        <RatingDistributionChart data={stats.ratingDistribution} />
        <EntriesPerMonthChart data={stats.entriesPerMonth} />
      </div>
    </div>
  )
}
