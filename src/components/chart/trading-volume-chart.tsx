'use client'

import { useState } from 'react'
import { useChartData } from '@/hooks/use-chart-data'
import { Button } from '@/components/ui/button'
import { AreaChartContainer } from '@/components/chart/area-chart-container'

const chartConfig = {
  value: {
    color: '#0AC18E'
  }
}

export function TradingVolumeChart({ poolAddress, volume24h }: { poolAddress: string; volume24h: string }) {
  const [interval, setInterval] = useState('1D')
  const { data = [] } = useChartData('volume', interval, poolAddress)

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-2">
        <div className="h-12">
          <div className="text-gray text-sm">Trading Volume (24h)</div>
          <div>{volume24h} </div>
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
      <AreaChartContainer config={chartConfig} data={data}></AreaChartContainer>
    </div>
  )
}
