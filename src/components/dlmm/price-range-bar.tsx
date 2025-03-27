'use client'

import { Bar, BarChart, CartesianGrid } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { Slider } from '@/components/ui/slider'

interface PriceRangeBarProps {
  priceRange: number[]
  onRangeChange: (v: number[]) => void
}

export function PriceRangeBar({ priceRange, onRangeChange }: PriceRangeBarProps) {
  const spotConfig = {
    spotA: { color: '#BE46FF' },
    spotB: { color: '#2848FF' }
  }

  const spotRangeA = Array(20).fill({ spotA: 40, spotB: 0 })
  const spotRangeB = Array(20).fill({ spotA: 0, spotB: 40 })
  const spotData = [...spotRangeA, { spotA: 20, spotB: 20 }, ...spotRangeB]

  const rangeConfig = {
    range: { color: '#808085' },
    rest: { color: '#4B4B4B' }
  }

  const rangeData = [
    ...Array(5).fill({ rest: 0, range: 35 }),
    ...Array(5).fill({ rest: 0, range: 37 }),
    ...Array(5).fill({ rest: 0, range: 33 }),
    ...Array(5).fill({ rest: 40, range: 0 }),
    ...Array(5).fill({ rest: 35, range: 0 }),
    ...Array(5).fill({ rest: 40, range: 0 }),
    ...Array(5).fill({ rest: 0, range: 32 }),
    ...Array(5).fill({ rest: 0, range: 37 }),
    ...Array(5).fill({ rest: 0, range: 35 })
  ]

  return (
    <div>
      <div className="my-4">
        <ChartContainer config={spotConfig} className="h-20 w-full">
          <BarChart accessibilityLayer data={spotData}>
            <CartesianGrid vertical={false} />
            <Bar isAnimationActive={false} dataKey="spotA" stackId="a" fill="var(--color-spotA)" radius={4} />
            <Bar isAnimationActive={false} dataKey="spotB" stackId="a" fill="var(--color-spotB)" radius={4} />
          </BarChart>
        </ChartContainer>
        <Slider value={[50]} max={100} step={1} className="w-full" />
      </div>
      <div className="my-4">
        <ChartContainer config={rangeConfig} className="h-20 w-full">
          <BarChart accessibilityLayer data={rangeData}>
            <CartesianGrid vertical={false} />
            <Bar isAnimationActive={false} dataKey="range" stackId="a" fill="var(--color-range)" radius={4} />
            <Bar isAnimationActive={false} dataKey="rest" stackId="a" fill="var(--color-rest)" radius={4} />
          </BarChart>
        </ChartContainer>
        <Slider value={priceRange} max={100} step={1} className="w-full" onValueChange={onRangeChange} />
      </div>
    </div>
  )
}
