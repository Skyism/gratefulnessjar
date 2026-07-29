import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMoments } from '@/hooks/useMoments'
import { RatingBadge } from '../common/RatingSelector'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { formatDateString } from '@/lib/services/dateService'
import { Gem } from 'lucide-react'

interface RandomMomentCardProps {
  showViewAllLink?: boolean
  className?: string
}

/**
 * RandomMomentCard - Draw a random moment to remember
 *
 * Design: Mirrors the "From the Jar" card on the homescreen
 * Picks from store state so it self-heals when the picked moment
 * is deleted; renders nothing when there are no moments
 */
export function RandomMomentCard({ showViewAllLink = true, className }: RandomMomentCardProps) {
  const { moments } = useMoments()
  const [pickedId, setPickedId] = useState<string | null>(null)

  const picked = moments.find((m) => m.id === pickedId) ?? null

  // Pick initially, and re-pick if the current moment was deleted
  useEffect(() => {
    if (moments.length === 0) {
      if (pickedId !== null) setPickedId(null)
      return
    }
    if (!pickedId || !moments.some((m) => m.id === pickedId)) {
      setPickedId(moments[Math.floor(Math.random() * moments.length)].id)
    }
  }, [moments, pickedId])

  const pullAnother = () => {
    if (moments.length <= 1) return
    // Always land on a different moment than the current one
    const others = moments.filter((m) => m.id !== pickedId)
    setPickedId(others[Math.floor(Math.random() * others.length)].id)
  }

  if (!picked) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Gem className="w-5 h-5 text-amber-600" />
          A Moment to Remember
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <time className="text-sm font-medium text-stone-700">
            {formatDateString(picked.moment_date)}
          </time>
          <RatingBadge rating={picked.rating} size="sm" showLabel={false} />
        </div>
        <p className="text-sm font-medium text-stone-900">
          {picked.title}
        </p>
        {picked.description && (
          <p className="text-sm font-serif leading-relaxed text-stone-700 line-clamp-3">
            {picked.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          {moments.length > 1 ? (
            <button
              onClick={pullAnother}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              Pull another →
            </button>
          ) : (
            <span />
          )}
          {showViewAllLink && (
            <Link
              to="/moments"
              className="text-xs text-stone-500 hover:text-amber-700 font-medium"
            >
              View all moments →
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
