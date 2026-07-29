import { useState, useEffect } from 'react'
import type { Moment, Rating, CreateMomentInput, UpdateMomentInput } from '@/types'
import { RatingSelector } from '../common/RatingSelector'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { getTodayDateString } from '@/lib/services/dateService'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MomentFormProps {
  moment?: Moment | null
  onSave: (data: CreateMomentInput | UpdateMomentInput) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  className?: string
}

/**
 * MomentForm - Create or edit moments to remember
 *
 * Design: Mirrors EntryForm — title and date inputs, optional
 * description, and the shared happiness rating selector
 */
export function MomentForm({
  moment,
  onSave,
  onCancel,
  isSubmitting = false,
  className,
}: MomentFormProps) {
  const [title, setTitle] = useState(moment?.title || '')
  const [momentDate, setMomentDate] = useState(moment?.moment_date || getTodayDateString())
  const [description, setDescription] = useState(moment?.description || '')
  const [rating, setRating] = useState<Rating | null>(moment?.rating || null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isEdit = !!moment
  const titleCount = title.length
  const descriptionCount = description.length
  const isValid = title.trim().length > 0 && rating !== null && !!momentDate

  // Reset form when moment changes
  useEffect(() => {
    if (moment) {
      setTitle(moment.title)
      setMomentDate(moment.moment_date)
      setDescription(moment.description || '')
      setRating(moment.rating)
    }
  }, [moment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isValid) {
      setError('Please add a title, pick a date, and rate the moment')
      return
    }

    setIsSaving(true)

    try {
      const data = {
        moment_date: momentDate,
        title,
        description: description.trim() || undefined,
        rating: rating!,
      }
      await onSave(isEdit ? (data as UpdateMomentInput) : (data as CreateMomentInput))

      // Show success state briefly
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)

      // Reset form if creating new moment
      if (!isEdit) {
        setTitle('')
        setMomentDate(getTodayDateString())
        setDescription('')
        setRating(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save moment')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      {/* Title input */}
      <div className="space-y-2">
        <Label htmlFor="moment-title" className="text-base font-medium text-stone-900">
          What happened?
        </Label>
        <Input
          id="moment-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A moment worth remembering..."
          disabled={isSaving || isSubmitting}
          maxLength={100}
          aria-describedby="title-char-count"
        />
        <div className="flex justify-end">
          <p
            id="title-char-count"
            className={cn(
              'text-xs font-mono',
              titleCount > 90 ? 'text-amber-600' : 'text-stone-400'
            )}
          >
            {titleCount}/100
          </p>
        </div>
      </div>

      {/* Date input */}
      <div className="space-y-2">
        <Label htmlFor="moment-date" className="text-base font-medium text-stone-900">
          When was it?
        </Label>
        <Input
          id="moment-date"
          type="date"
          value={momentDate}
          onChange={(e) => setMomentDate(e.target.value)}
          max={getTodayDateString()}
          disabled={isSaving || isSubmitting}
        />
      </div>

      {/* Description input */}
      <div className="space-y-2">
        <Label htmlFor="moment-description" className="text-base font-medium text-stone-900">
          Tell the story <span className="font-normal text-stone-500">(optional)</span>
        </Label>
        <Textarea
          id="moment-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What made this moment special?"
          className="min-h-[120px] text-base resize-none"
          disabled={isSaving || isSubmitting}
          maxLength={1000}
          aria-describedby="description-char-count"
        />
        <div className="flex justify-end">
          <p
            id="description-char-count"
            className={cn(
              'text-xs font-mono',
              descriptionCount > 900 ? 'text-amber-600' : 'text-stone-400'
            )}
          >
            {descriptionCount}/1000
          </p>
        </div>
      </div>

      {/* Rating selector */}
      <RatingSelector
        value={rating}
        onChange={setRating}
        disabled={isSaving || isSubmitting}
        label="How happy was this moment?"
      />

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={!isValid || isSaving || isSubmitting}
          className="flex-1 sm:flex-none"
        >
          {isSaving || isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : isEdit ? (
            'Update Moment'
          ) : (
            'Save Moment'
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving || isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
