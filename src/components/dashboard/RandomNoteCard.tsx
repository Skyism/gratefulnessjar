import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RatingBadge } from '@/components/common/RatingSelector'
import type { Entry } from '@/types/entry'
import { getRandomEntry } from '@/lib/services/entryService'
import { formatDateWithDay } from '@/lib/services/dateService'
import { Sparkles, RefreshCw } from 'lucide-react'

/**
 * RandomNoteCard - Display a random gratitude entry with refresh button
 * Pattern similar to "From the Jar" on HomePage
 */
export function RandomNoteCard() {
  const [randomEntry, setRandomEntry] = useState<Entry | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadRandomEntry = async () => {
    setIsLoading(true)
    try {
      const entry = await getRandomEntry()
      setRandomEntry(entry)
    } catch (error) {
      console.error('Failed to load random entry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRandomEntry()
  }, [])

  return (
    <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Random Gratitude Moment</span>
          </div>
          <Button
            onClick={loadRandomEntry}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {randomEntry ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">
                {formatDateWithDay(randomEntry.entry_date)}
              </span>
              <RatingBadge rating={randomEntry.rating} size="sm" />
            </div>
            <p className="text-stone-800 leading-relaxed font-serif italic">
              "{randomEntry.gratitude_text}"
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500">
            No entries yet. Start writing to see your gratitude moments!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
