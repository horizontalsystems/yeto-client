'use client'

import { Area, AreaChart, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartData = [
  { tvl: 186 },
  { tvl: 170 },
  { tvl: 160 },
  { tvl: 180 },
  { tvl: 190 },
  { tvl: 200 },
  { tvl: 240 },
  { tvl: 280 },
  { tvl: 305 },
  { tvl: 315 },
  { tvl: 335 },
  { tvl: 345 },
  { tvl: 237 },
  { tvl: 207 },
  { tvl: 217 },
  { tvl: 73 },
  { tvl: 79 },
  { tvl: 90 },
  { tvl: 29 },
  { tvl: 90 },
  { tvl: 120 },
  { tvl: 209 },
  { tvl: 209 },
  { tvl: 214 }
]

const chartConfig = {
  tvl: {
    color: '#2848FF'
  }
}

export function TvlChart() {
  return (
    <ChartContainer config={chartConfig} className="h-40 w-full">
      <AreaChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Area dataKey="tvl" type="natural" fill="var(--color-tvl)" fillOpacity={0.4} stroke="var(--color-tvl)" />
      </AreaChart>
    </ChartContainer>
  )
}
