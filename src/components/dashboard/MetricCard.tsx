import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  iconColor?: string
  className?: string
}

/**
 * MetricCard - Display a single metric with icon, value, and label
 * Pattern follows StatCard from MonthStats.tsx
 */
export function MetricCard({
  icon: Icon,
  value,
  label,
  iconColor = 'text-amber-600',
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="flex flex-col items-center gap-2 p-6">
        <div className={cn('flex items-center justify-center', iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-3xl font-bold text-stone-900">{value}</div>
        <div className="text-sm text-stone-600 text-center font-medium">
          {label}
        </div>
      </CardContent>
    </Card>
  )
}
