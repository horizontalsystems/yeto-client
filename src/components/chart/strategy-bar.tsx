import { Bar, BarChart, CartesianGrid, Cell } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { memo, useMemo } from 'react'

interface RangeBarProps {
  activeBinId: number
  strategy: string
  data: {
    liquidity: string
    activeBin?: boolean
    rangeX?: boolean
    rangeY?: boolean
    binId: number
  }[]
}

function StrategyBarComponent({ data, strategy, activeBinId }: RangeBarProps) {
  const config = {
    activeBin: { color: '#82ca9d' },
    rangeX: { color: '#BE46FF' },
    rangeY: { color: '#2848FF' },
    range: { color: '#808085' }
  }

  const items = useMemo(() => {
    return data.map(item => {
      let range = 40

      if (strategy === 'Bid-Ask') {
        const distance = Math.abs(item.binId - activeBinId)

        if (item.binId < activeBinId) {
          range = distance
        } else if (item.binId > activeBinId) {
          range = distance
        } else {
          range = 1
        }
      }

      return { ...item, range: range }
    })
  }, [data, strategy])

  return (
    <ChartContainer config={config} className="h-20 w-full">
      <BarChart accessibilityLayer data={items}>
        <CartesianGrid vertical={false} />
        <Bar dataKey="range" stackId="a" radius={4}>
          {items.map((entry, index) => {
            let fillColor
            if (entry.rangeX) {
              fillColor = config.rangeX.color
            } else if (entry.rangeY) {
              fillColor = config.rangeY.color
            } else {
              fillColor = config.activeBin.color
            }

            if (entry.activeBin) {
              fillColor = '#F5F5F5'
            }

            return <Cell fill={fillColor} key={`cell-${index}`} />
          })}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export const StrategyBar = memo(StrategyBarComponent)
