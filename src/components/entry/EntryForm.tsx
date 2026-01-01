import { useState, useEffect } from 'react'
import type { Entry, Rating, CreateEntryInput, UpdateEntryInput } from '@/types'
import { RatingSelector } from '../common/RatingSelector'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntryFormProps {
  entry?: Entry | null
  dateString?: string
  onSave: (data: CreateEntryInput | UpdateEntryInput) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  className?: string
}

/**
 * EntryForm - Create or edit gratitude entries
 *
 * Design: Clean, spacious form with serif font for the text area
 * Emphasizes the journaling experience
 */
export function EntryForm({
  entry,
  dateString,
  onSave,
  onCancel,
  isSubmitting = false,
  className,
}: EntryFormProps) {
  const [gratitudeText, setGratitudeText] = useState(entry?.gratitude_text || '')
  const [rating, setRating] = useState<Rating | null>(entry?.rating || null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const isEdit = !!entry
  const charCount = gratitudeText.length
  const isValid = gratitudeText.trim().length > 0 && rating !== null

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      setGratitudeText(entry.gratitude_text)
      setRating(entry.rating)
    }
  }, [entry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isValid) {
      setError('Please write something you\'re grateful for and rate your day')
      return
    }

    setIsSaving(true)

    try {
      if (isEdit && entry) {
        // Update existing entry
        await onSave({
          gratitude_text: gratitudeText,
          rating: rating!,
        } as UpdateEntryInput)
      } else {
        // Create new entry
        await onSave({
          entry_date: dateString || '',
          gratitude_text: gratitudeText,
          rating: rating!,
        } as CreateEntryInput)
      }

      // Show success state briefly
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)

      // Reset form if creating new entry
      if (!isEdit) {
        setGratitudeText('')
        setRating(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
    >
      {/* Gratitude text input */}
      <div className="space-y-2">
        <Label htmlFor="gratitude-text" className="text-base font-medium text-stone-900">
          What are you grateful for today?
        </Label>
        <Textarea
          id="gratitude-text"
          value={gratitudeText}
          onChange={(e) => setGratitudeText(e.target.value)}
          placeholder="Something that made you smile, a small victory, or a moment of peace..."
          className="min-h-[120px] text-base resize-none"
          disabled={isSaving || isSubmitting}
          maxLength={1000}
          aria-describedby="char-count"
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-stone-500">
            Keep it simple. One sentence is enough.
          </p>
          <p
            id="char-count"
            className={cn(
              'text-xs font-mono',
              charCount > 900 ? 'text-amber-600' : 'text-stone-400'
            )}
          >
            {charCount}/1000
          </p>
        </div>
      </div>

      {/* Rating selector */}
      <RatingSelector
        value={rating}
        onChange={setRating}
        disabled={isSaving || isSubmitting}
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
            'Update Entry'
          ) : (
            'Save Entry'
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
