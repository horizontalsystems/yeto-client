import { useQuery } from '@tanstack/react-query'

export function useChartData(type: 'volume' | 'liquidity' | 'price', interval: string, poolAddress?: string) {
  return useQuery({
    queryKey: ['chart-data', type, interval],
    queryFn: async () => {
      const resource = poolAddress || 'all_pools'
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/charts/${resource}?type=${type}&interval=${interval}`
      )
      return await res.json()
    },
    staleTime: 1000 * 60
  })
}
