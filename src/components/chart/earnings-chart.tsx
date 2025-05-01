'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toAmount } from '@/lib/utils'
import { AreaChartContainer } from '@/components/chart/area-chart-container'

const chartConfig = {
  value: {
    color: '#2848FF'
  }
}

export function EarningsChart() {
  const [interval, setInterval] = useState('1D')
  const data = [
    { value: 186 },
    { value: 170 },
    { value: 160 },
    { value: 180 },
    { value: 190 },
    { value: 200 },
    { value: 240 },
    { value: 280 },
    { value: 305 },
    { value: 315 },
    { value: 335 },
    { value: 345 },
    { value: 237 },
    { value: 207 },
    { value: 217 },
    { value: 73 },
    { value: 79 },
    { value: 90 },
    { value: 29 },
    { value: 90 },
    { value: 120 },
    { value: 209 },
    { value: 209 },
    { value: 214 }
  ]
  const lastItem = data[data.length - 1]

  return (
    <div className="bg-card col-span-2 flex flex-col justify-between rounded-xl p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-2">
        <div className="h-12">
          <div>Total Earnings</div>
          <div>{toAmount(lastItem ? lastItem['value'] : 0 || 0)} </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['1D', '30D', '90D', 'all'].map(i => (
            <Button
              key={i}
              size="sm"
              variant={i === interval ? 'default' : 'ghost'}
              className={`rounded-2xl ${i === interval ? 'bg-blue text-bright' : 'text-leah bg-bran'}`}
              onClick={() => setInterval(i)}
              disabled
            >
              {i.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      <AreaChartContainer config={chartConfig} data={data as never[]}></AreaChartContainer>
    </div>
  )
}
