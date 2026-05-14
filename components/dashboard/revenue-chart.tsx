"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useTranslation } from "@/i18n/context"

interface RevenueChartProps {
  data: { name: string; revenue: number }[]
}

function formatChartCurrency(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
  return String(value)
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { t } = useTranslation();

  const chartConfig = {
    revenue: {
      label: t('dashboard.total_revenue'),
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={formatChartCurrency}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" radius={8}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill="hsl(var(--chart-4))" />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
