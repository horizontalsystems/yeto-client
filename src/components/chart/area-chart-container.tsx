import { Area, AreaChart as RechartArea } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function AreaChartContainer({ config, data }: { config: ChartConfig; data: never[] }) {
  return (
    <ChartContainer config={config} className="h-40 w-full">
      <RechartArea data={data}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              indicator="line"
              formatter={(value, name, item) => (
                <div className="text-muted-foreground min-w-[130px] items-center text-xs">
                  <div>{item.payload.value}</div>
                  <div>{new Date(item.payload.timestamp).toLocaleString()}</div>
                </div>
              )}
            />
          }
        />
        <Area dataKey="value" type="natural" fill="var(--color-value)" fillOpacity={0.4} stroke="var(--color-value)" />
      </RechartArea>
    </ChartContainer>
  )
}
