import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

interface EntriesPerMonthChartProps {
  data: Array<{
    month: string
    count: number
    year: number
    monthIndex: number
  }>
}

/**
 * EntriesPerMonthChart - Bar chart showing entries per month
 */
export function EntriesPerMonthChart({ data }: EntriesPerMonthChartProps) {
  const chartConfig = {
    count: {
      label: 'Entries',
      color: 'hsl(var(--chart-1))',
    },
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            Entries Per Month
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
          <BarChart3 className="w-5 h-5 text-amber-600" />
          Entries Per Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-stone-200" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="text-stone-600"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-stone-600"
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
