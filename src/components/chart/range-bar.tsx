import { Bar, BarChart, CartesianGrid, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { memo } from 'react'

interface RangeBarProps {
  activeBinId: number
  data: {
    liquidity: string
    activeBin?: boolean
  }[]
}

function RangeBarComponent({ data }: RangeBarProps) {
  const config = {
    liquidity: { color: '#808085' },
    activeBin: { color: '#F5F5F5' }
  }

  return (
    <ChartContainer config={config} className="h-20 w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              indicator="line"
              formatter={(value, name, item) => (
                <div className="text-muted-foreground min-w-[130px] items-center text-xs">
                  <div className="flex justify-between">
                    <div>Amount X</div>
                    <div>{item.payload.amountX}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Amount Y</div>
                    <div>{item.payload.amountY}</div>
                  </div>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="liquidity" stackId="a" radius={4}>
          {data.map((entry, index) => (
            <Cell fill={entry.activeBin ? config.activeBin.color : config.liquidity.color} key={`cell-${index}`} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export const RangeBar = memo(RangeBarComponent)
