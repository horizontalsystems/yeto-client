import { DlmmList } from '@/components/dlmm/dlmm-list'
import { TvlChart } from '@/components/chart/tvl-chart'
import { VolumeChart } from '@/components/chart/volume-chart'
import { getQueryClient } from '@/hooks/react-query-client'
import { getPools } from '@/lib/api'

export default async function Home() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['pools', ''],
    queryFn: () => getPools('')
  })

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="mt-6 flex flex-1 flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <TvlChart />
          <VolumeChart />
        </div>
        <div className="auto-rows-min gap-4 px-2 sm:px-0 md:grid-cols-2">
          <DlmmList />
        </div>
      </div>
    </div>
  )
}
