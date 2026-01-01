import { useEffect, useState } from 'react'
import { useEntryStore } from '@/store/entryStore'
import { getTodayDateString } from '@/lib/services/dateService'
import { getRandomEntry } from '@/lib/services/entryService'
import { EntryForm } from '@/components/entry/EntryForm'
import { EntryDetail } from '@/components/entry/EntryDetail'
import { RatingBadge } from '@/components/common/RatingSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, TrendingUp } from 'lucide-react'
import type { Entry } from '@/types'

/**
 * HomePage - Today's entry with intelligent two-column layout
 *
 * Design Philosophy:
 * - Left (60%): Entry form/detail - the primary action
 * - Right (40%): Context panel - past entry, streak, motivation
 * - Mobile: Stack vertically
 * - NO centered narrow column - use full horizontal space
 */
export function HomePage() {
  const { todayEntry, createTodayEntry, updateEntry, deleteEntry, loadTodayEntry } = useEntryStore()
  const [randomEntry, setRandomEntry] = useState<Entry | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Load today's entry and a random past entry
  useEffect(() => {
    loadTodayEntry()
    loadRandomEntry()
  }, [loadTodayEntry])

  const loadRandomEntry = async () => {
    const entry = await getRandomEntry()
    setRandomEntry(entry)
  }

  const handleCreate = async (data: any) => {
    await createTodayEntry(data)
    setIsEditing(false)
  }

  const handleUpdate = async (id: string, data: any) => {
    await updateEntry(id, data)
    setIsEditing(false)
  }

  const handleDelete = async (id: string) => {
    await deleteEntry(id)
  }

  const hasEntry = !!todayEntry

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT COLUMN: Entry Form/Detail (60% / 3 cols) */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold text-stone-900 mb-1">
                {hasEntry && !isEditing ? "Today's Entry" : 'What are you grateful for today?'}
              </h1>
              <p className="text-sm text-stone-600 font-mono">
                {getTodayDateString()}
              </p>
            </div>

            {/* Content */}
            <Card>
              <CardContent className="p-6">
                {hasEntry && !isEditing ? (
                  <EntryDetail
                    entry={todayEntry}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ) : (
                  <EntryForm
                    dateString={getTodayDateString()}
                    onSave={handleCreate}
                    entry={isEditing ? todayEntry : null}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: Context Panel (40% / 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Random past entry */}
          {randomEntry && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  From the Jar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <time className="text-sm font-medium text-stone-700">
                    {new Date(randomEntry.entry_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <RatingBadge rating={randomEntry.rating} size="sm" showLabel={false} />
                </div>
                <p className="text-sm font-serif leading-relaxed text-stone-700">
                  {randomEntry.gratitude_text}
                </p>
                <button
                  onClick={loadRandomEntry}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  Pull another →
                </button>
              </CardContent>
            </Card>
          )}

          {/* Motivation / Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Reflection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-stone-700 leading-relaxed">
                  <strong className="text-stone-900">Small moments matter.</strong> Gratitude isn't about perfection—it's about noticing what's good, even on difficult days.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200 space-y-2">
                <p className="text-xs font-medium text-stone-600 uppercase tracking-wide">
                  Ideas to spark gratitude:
                </p>
                <ul className="space-y-1.5 text-sm text-stone-600">
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span>A kind word from someone</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span>A moment of calm in a busy day</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Something that made you laugh</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600">•</span>
                    <span>Progress on something you're working on</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Empty state for first-time users */}
          {!hasEntry && !randomEntry && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6 space-y-2">
                <p className="text-sm font-medium text-amber-900">
                  Welcome to your Gratefulness Jar!
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Take 30 seconds each day to capture one thing you're grateful for. Over time, you'll build a collection of moments worth remembering.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
