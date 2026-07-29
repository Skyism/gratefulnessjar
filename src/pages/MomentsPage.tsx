import { useState } from 'react'
import { useMoments } from '@/hooks/useMoments'
import type { CreateMomentInput, UpdateMomentInput } from '@/types'
import { MomentForm } from '@/components/moment/MomentForm'
import { MomentCard } from '@/components/moment/MomentCard'
import { MomentDetail } from '@/components/moment/MomentDetail'
import { RandomMomentCard } from '@/components/moment/RandomMomentCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gem, Plus } from 'lucide-react'

/**
 * MomentsPage - Capture and browse moments to remember
 *
 * Design Philosophy:
 * - Left (60%): random draw, collapsible add form, moment list
 * - Right (40%): selected moment detail
 * - Mobile: detail renders inline above the list
 * - No daily limit — any number of moments per day
 */
export function MomentsPage() {
  const {
    moments,
    selectedMoment,
    selectMoment,
    createMoment,
    updateMoment,
    deleteMoment,
  } = useMoments()

  const [showForm, setShowForm] = useState(false)

  const handleCreate = async (data: CreateMomentInput | UpdateMomentInput) => {
    await createMoment(data as CreateMomentInput)
    setShowForm(false)
  }

  const handleUpdate = async (id: string, data: UpdateMomentInput) => {
    await updateMoment(id, data)
  }

  const hasMoments = moments.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900">Moments to Remember</h1>
            <p className="text-sm text-stone-600 mt-1">
              {hasMoments
                ? `${moments.length} ${moments.length === 1 ? 'moment' : 'moments'} captured`
                : 'No moments yet'}
            </p>
          </div>

          <Button onClick={() => setShowForm((show) => !show)}>
            <Plus className="w-4 h-4" />
            Add moment
          </Button>
        </div>

        {!hasMoments && !showForm ? (
          /* Empty state */
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <Gem className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-stone-900">
                  Capture your first moment
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Save the moments you never want to forget — big wins, small joys,
                  days that mattered. Add as many as you like, whenever you like.
                </p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4"
              >
                Add your first moment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* LEFT: Random draw, add form, moment list (60%) */}
            <div className="lg:col-span-3 space-y-4">
              <RandomMomentCard showViewAllLink={false} />

              {showForm && (
                <Card>
                  <CardContent className="p-6">
                    <MomentForm
                      onSave={handleCreate}
                      onCancel={() => setShowForm(false)}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Mobile: selected moment detail above the list */}
              {selectedMoment && (
                <Card className="lg:hidden">
                  <CardContent className="p-6">
                    <MomentDetail
                      moment={selectedMoment}
                      onUpdate={handleUpdate}
                      onDelete={deleteMoment}
                    />
                  </CardContent>
                </Card>
              )}

              {moments.map((moment) => (
                <MomentCard
                  key={moment.id}
                  moment={moment}
                  onClick={() =>
                    selectMoment(selectedMoment?.id === moment.id ? null : moment)
                  }
                />
              ))}
            </div>

            {/* RIGHT: Moment detail (40%, desktop only) */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-20">
                {selectedMoment ? (
                  <Card>
                    <CardContent className="p-6">
                      <MomentDetail
                        moment={selectedMoment}
                        onUpdate={handleUpdate}
                        onDelete={deleteMoment}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-sm text-stone-500">
                        Select a moment to view it
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
