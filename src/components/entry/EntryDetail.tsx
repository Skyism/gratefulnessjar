import { useState } from 'react'
import type { Entry, UpdateEntryInput } from '@/types'
import { RatingBadge } from '../common/RatingSelector'
import { EntryForm } from './EntryForm'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { formatDateWithDay, formatDateString } from '@/lib/services/dateService'
import { Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntryDetailProps {
  entry: Entry
  onUpdate: (id: string, data: UpdateEntryInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
  className?: string
}

/**
 * EntryDetail - View and edit entry
 *
 * Design: Spacious detail view with inline editing
 */
export function EntryDetail({
  entry,
  onUpdate,
  onDelete,
  className,
}: EntryDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async (data: UpdateEntryInput) => {
    await onUpdate(entry.id, data)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(entry.id)
      setShowDeleteDialog(false)
    } catch (error) {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div className={className}>
        <EntryForm
          entry={entry}
          onSave={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-stone-900">
            {formatDateWithDay(entry.entry_date)}
          </h2>
          <time className="text-sm text-stone-500 font-mono">
            {formatDateString(entry.entry_date, 'EEEE, MMMM d, yyyy')}
          </time>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Rating */}
      <div>
        <RatingBadge rating={entry.rating} size="lg" showLabel />
      </div>

      {/* Gratitude text */}
      <div className="prose prose-stone max-w-none">
        <p className="text-lg font-serif leading-relaxed text-stone-800">
          {entry.gratitude_text}
        </p>
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-stone-200">
        <p className="text-xs text-stone-500 font-mono">
          Created {new Date(entry.created_at).toLocaleString()}
          {entry.updated_at !== entry.created_at && (
            <> · Updated {new Date(entry.updated_at).toLocaleString()}</>
          )}
        </p>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
