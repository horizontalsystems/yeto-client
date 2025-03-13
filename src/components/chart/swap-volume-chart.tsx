'use client'

import { Area, AreaChart, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartData = [
  { volume: 300 },
  { volume: 256 },
  { volume: 136 },
  { volume: 176 },
  { volume: 176 },
  { volume: 200 },
  { volume: 240 },
  { volume: 220 },
  { volume: 290 },
  { volume: 200 },
  { volume: 190 },
  { volume: 120 },
  { volume: 100 },
  { volume: 90 },
  { volume: 237 },
  { volume: 217 },
  { volume: 207 },
  { volume: 187 },
  { volume: 73 },
  { volume: 90 },
  { volume: 300 },
  { volume: 209 },
  { volume: 229 },
  { volume: 340 },
  { volume: 400 }
]

const chartConfig = {
  volume: {
    color: '#0AC18E'
  }
}

export function SwapVolumeChart() {
  return (
    <ChartContainer config={chartConfig} className="h-40 w-full">
      <AreaChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Area
          dataKey="volume"
          type="natural"
          fill="var(--color-volume)"
          fillOpacity={0.4}
          stroke="var(--color-volume)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
