import { useQuery } from '@tanstack/react-query'

export function useChartData(type: 'volume' | 'liquidity', interval: string) {
  return useQuery({
    queryKey: ['chart-data', type, interval],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/charts/all_pools?type=${type}&interval=${interval}`
      )
      const rawData = await res.json()
      return rawData.map((item: { value: number; timestamp: number }) => ({
        [type === 'volume' ? 'volume' : 'tvl']: item.value,
        timestamp: item.timestamp
      }))
    },
    staleTime: 1000 * 60
  })
}
