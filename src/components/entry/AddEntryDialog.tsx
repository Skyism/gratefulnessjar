import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { EntryForm } from './EntryForm'
import { useEntryStore } from '@/store/entryStore'
import { formatDateWithDay } from '@/lib/services/dateService'
import type { CreateEntryInput, UpdateEntryInput } from '@/types'

interface AddEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateString: string
  onSuccess?: () => void
}

/**
 * AddEntryDialog - Modal for creating entries for specific dates
 *
 * Allows users to add gratitude entries for past days by clicking
 * empty dates in the calendar view.
 */
export function AddEntryDialog({
  open,
  onOpenChange,
  dateString,
  onSuccess,
}: AddEntryDialogProps) {
  const { createEntry } = useEntryStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (data: CreateEntryInput | UpdateEntryInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Only handle CreateEntryInput since we're adding a new entry
      if ('entry_date' in data) {
        await createEntry(data as CreateEntryInput)

        // Call success callback if provided
        if (onSuccess) {
          onSuccess()
        }

        // Close dialog after successful save
        onOpenChange(false)
      } else {
        throw new Error('Invalid entry data')
      }
    } catch (err) {
      // Set error to display in dialog
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-stone-900">
            Add Entry for {formatDateWithDay(dateString)}
          </DialogTitle>
          <DialogDescription className="text-stone-600">
            Write what you're grateful for on this day
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <EntryForm
            dateString={dateString}
            onSave={handleSave}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
