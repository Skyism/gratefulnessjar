import { useState } from 'react'
import type { Moment, UpdateMomentInput } from '@/types'
import { RatingBadge } from '../common/RatingSelector'
import { MomentForm } from './MomentForm'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { formatDateString } from '@/lib/services/dateService'
import { Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MomentDetailProps {
  moment: Moment
  onUpdate: (id: string, data: UpdateMomentInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
  className?: string
}

/**
 * MomentDetail - View and edit a moment
 *
 * Design: Mirrors EntryDetail — spacious detail view with inline editing
 */
export function MomentDetail({
  moment,
  onUpdate,
  onDelete,
  className,
}: MomentDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async (data: UpdateMomentInput) => {
    await onUpdate(moment.id, data)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(moment.id)
      setShowDeleteDialog(false)
    } catch (error) {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div className={className}>
        <MomentForm
          moment={moment}
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
            {moment.title}
          </h2>
          <time className="text-sm text-stone-500 font-mono">
            {formatDateString(moment.moment_date, 'EEEE, MMMM d, yyyy')}
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
        <RatingBadge rating={moment.rating} size="lg" showLabel />
      </div>

      {/* Description */}
      <div className="prose prose-stone max-w-none">
        {moment.description ? (
          <p className="text-lg font-serif leading-relaxed text-stone-800">
            {moment.description}
          </p>
        ) : (
          <p className="text-sm text-stone-500 italic">No description</p>
        )}
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-stone-200">
        <p className="text-xs text-stone-500 font-mono">
          Created {new Date(moment.created_at).toLocaleString()}
          {moment.updated_at !== moment.created_at && (
            <> · Updated {new Date(moment.updated_at).toLocaleString()}</>
          )}
        </p>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete moment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this moment? This action cannot be undone.
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
