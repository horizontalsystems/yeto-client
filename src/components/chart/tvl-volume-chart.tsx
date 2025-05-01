'use client'

import { useState } from 'react'
import { useChartData } from '@/hooks/use-chart-data'
import { Button } from '@/components/ui/button'
import { toAmount } from '@/lib/utils'
import { AreaChartContainer } from '@/components/chart/area-chart-container'

const chartConfig = {
  value: {
    color: '#2848FF'
  }
}

export function TvlVolumeChart() {
  const [interval, setInterval] = useState('1D')
  const { data = [] } = useChartData('liquidity', interval)
  const lastItem = data[data.length - 1]

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-2">
        <div className="h-12">
          <div>Total Value Locked</div>
          <div>{toAmount(lastItem ? lastItem['value'] : 0 || 0)} </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['1D', '30D', '90D', 'all'].map(i => (
            <Button
              key={i}
              size="sm"
              variant={i === interval ? 'default' : 'ghost'}
              className={`rounded-2xl ${i === interval ? 'bg-blue text-bright' : 'text-bright bg-bran'}`}
              onClick={() => setInterval(i)}
            >
              {i.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      <AreaChartContainer config={chartConfig} data={data}></AreaChartContainer>
    </div>
  )
}
