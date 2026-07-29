import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

interface RatingOverTimeChartProps {
  data: Array<{
    date: string
    rating: number
    formattedDate: string
  }>
}

/**
 * RatingOverTimeChart - Area chart showing rating trends over time
 */
export function RatingOverTimeChart({ data }: RatingOverTimeChartProps) {
  const chartConfig = {
    rating: {
      label: 'Rating',
      color: 'hsl(var(--chart-1))',
    },
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Rating Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center text-stone-500">
          No data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          Rating Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                className="text-stone-600"
              />
              <YAxis
                domain={[0, 7]}
                ticks={[1, 2, 3, 4, 5, 6, 7]}
                tick={{ fontSize: 12 }}
                className="text-stone-600"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="#f59e0b"
                fill="url(#ratingGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
