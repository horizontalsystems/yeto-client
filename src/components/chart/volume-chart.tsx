'use client'

import { useState } from 'react'
import { Area, AreaChart } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useChartData } from '@/hooks/use-chart-data'
import { Button } from '@/components/ui/button'
import { toAmount } from '@/lib/utils'

const chartConfig = {
  volume: {
    color: '#0AC18E'
  }
}

export function VolumeChart() {
  const [interval, setInterval] = useState('1D')
  const { data = [] } = useChartData('volume', interval)
  const lastItem = data[data.length - 1]

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-2">
        <div className="h-12">
          <div>Swap Volume</div>
          <div>{toAmount(lastItem ? lastItem['volume'] : 0 || 0)} </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['1D', '30D', '90D', 'all'].map(i => (
            <Button
              key={i}
              size="sm"
              variant={i === interval ? 'default' : 'ghost'}
              className={`rounded-2xl ${i === interval ? 'bg-blue text-bright' : 'text-leah bg-bran'}`}
              onClick={() => setInterval(i)}
            >
              {i.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-40 w-full">
        <AreaChart data={data}>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                indicator="line"
                formatter={(value, name, item) => (
                  <div className="text-muted-foreground min-w-[130px] items-center text-xs">
                    <div>{item.payload.volume}</div>
                    <div>{new Date(item.payload.timestamp).toLocaleString()}</div>
                  </div>
                )}
              />
            }
          />
          <Area
            dataKey="volume"
            type="natural"
            fill="var(--color-volume)"
            fillOpacity={0.4}
            stroke="var(--color-volume)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
