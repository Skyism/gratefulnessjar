import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { PieChart as PieChartIcon } from 'lucide-react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

interface RatingDistributionChartProps {
  data: Array<{
    rating: number
    label: string
    count: number
    percentage: number
    fill: string
  }>
}

/**
 * RatingDistributionChart - Pie chart showing rating distribution
 */
export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
  const chartConfig = {
    count: {
      label: 'Count',
    },
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-amber-600" />
            Rating Distribution
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
          <PieChartIcon className="w-5 h-5 text-amber-600" />
          Rating Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-stone-200">
                        <p className="font-medium text-stone-900">{data.label}</p>
                        <p className="text-sm text-stone-600">
                          {data.count} entries ({data.percentage}%)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percentage }) => `${label}: ${percentage}%`}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(_value, entry: any) => {
                  const item = entry.payload
                  return `${item.label} (${item.count})`
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
