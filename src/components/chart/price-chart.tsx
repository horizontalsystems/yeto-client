'use client'

import { useState } from 'react'
import { useChartData } from '@/hooks/use-chart-data'
import { Button } from '@/components/ui/button'
import { AreaChartContainer } from '@/components/chart/area-chart-container'

const chartConfig = {
  value: {
    color: '#2848FF'
  }
}

export function PriceChart({ poolAddress, currentPrice }: { poolAddress: string; currentPrice: string }) {
  const [interval, setInterval] = useState('1D')
  const { data = [] } = useChartData('price', interval, poolAddress)

  return (
    <div className="bg-card rounded-xl p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-2">
        <div className="h-12">
          <div className="text-gray text-sm">Current Price</div>
          <div>{currentPrice} </div>
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
