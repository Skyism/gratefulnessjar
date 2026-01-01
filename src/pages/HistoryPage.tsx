import { useState, useEffect } from 'react'
import { useEntries } from '@/hooks/useEntries'
import { CalendarView } from '@/components/history/CalendarView'
import { EntryCard } from '@/components/entry/EntryCard'
import { EntryDetail } from '@/components/entry/EntryDetail'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * HistoryPage - View all past entries with three-column layout
 *
 * Design Philosophy:
 * - Left (20%): Month picker & filters
 * - Center (40%): Calendar grid
 * - Right (40%): Entry detail
 * - Mobile: Tabs for different views
 */
export function HistoryPage() {
  const {
    entries,
    selectedEntry,
    selectEntry,
    updateEntry,
    deleteEntry,
  } = useEntries()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  // Auto-select entry when date is clicked
  useEffect(() => {
    if (selectedDate) {
      const entry = entries.find((e) => e.entry_date === selectedDate)
      selectEntry(entry || null)
    }
  }, [selectedDate, entries, selectEntry])

  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString)
  }

  const hasEntries = entries.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900">History</h1>
            <p className="text-sm text-stone-600 mt-1">
              {hasEntries
                ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} recorded`
                : 'No entries yet'}
            </p>
          </div>

          {/* View toggle (mobile) */}
          <div className="flex gap-2 lg:hidden">
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              <Calendar className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!hasEntries ? (
          /* Empty state */
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-stone-900">
                  Your gratitude journey begins today
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Start writing daily entries to build your collection of grateful moments.
                  They'll appear here as a visual timeline.
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = '/')}
                className="mt-4"
              >
                Write your first entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Desktop: Three-column layout, Mobile: Single column with tabs */
          <>
            {/* Desktop layout */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-6">
              {/* CENTER: Calendar (3 cols / 60%) */}
              <div className="lg:col-span-3">
                <CalendarView
                  entries={entries}
                  onSelectDate={handleSelectDate}
                  selectedDate={selectedDate}
                />
              </div>

              {/* RIGHT: Entry detail (2 cols / 40%) */}
              <div className="lg:col-span-2">
                {selectedEntry ? (
                  <Card>
                    <CardContent className="p-6">
                      <EntryDetail
                        entry={selectedEntry}
                        onUpdate={updateEntry}
                        onDelete={deleteEntry}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-sm text-stone-500">
                        Select a day to view your entry
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Mobile layout */}
            <div className="lg:hidden space-y-6">
              {view === 'calendar' ? (
                <div className="space-y-4">
                  <CalendarView
                    entries={entries}
                    onSelectDate={handleSelectDate}
                    selectedDate={selectedDate}
                  />
                  {selectedEntry && (
                    <Card>
                      <CardContent className="p-6">
                        <EntryDetail
                          entry={selectedEntry}
                          onUpdate={updateEntry}
                          onDelete={deleteEntry}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle>All Entries</CardTitle>
                  </CardHeader>
                  {entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => {
                        selectEntry(entry)
                        setSelectedDate(entry.entry_date)
                        setView('calendar')
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
