import { TvlChart } from '@/components/chart/tvl-chart'
import { Button } from '@/components/ui/button'
import { SwapVolumeChart } from '@/components/chart/swap-volume-chart'
import { MyPoolList } from '@/components/my-board/my-pool-list'

export default async function MyBoard() {
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="mt-6 flex flex-1 flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-card rounded-xl p-5">
            <div className="flex justify-between">
              <div>
                <div>Total Earnings</div>
                <div>$926,497,170.32</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">1D</Button>
                <Button size="sm" variant="outline" className="text-white">
                  30D
                </Button>
                <Button size="sm" variant="outline" className="text-white">
                  90D
                </Button>
                <Button size="sm" variant="outline" className="text-white">
                  All
                </Button>
              </div>
            </div>
            <TvlChart />
          </div>
          <div className="bg-card rounded-xl p-5">
            <div className="flex justify-between">
              <div>
                <div>Swap Volume</div>
                <div>$152,170.32</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">1D</Button>
                <Button size="sm" variant="outline" className="text-white">
                  30D
                </Button>
                <Button size="sm" variant="outline" className="text-white">
                  90D
                </Button>
                <Button size="sm" variant="outline" className="text-white">
                  All
                </Button>
              </div>
            </div>
            <SwapVolumeChart />
          </div>
          <div className="bg-card rounded-xl p-5">
            <div className="flex justify-between">
              <div>
                <div>Swap Volume</div>
                <div>$152,170.32</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">1D</Button>
                <Button size="sm" variant="outline" className="text-white">
                  30D
                </Button>
                <Button size="sm" variant="outline" className="text-white">
                  90D
                </Button>
                <Button size="sm" variant="outline" className="text-white">
                  All
                </Button>
              </div>
            </div>
            <SwapVolumeChart />
          </div>
        </div>
        <MyPoolList />
      </div>
    </div>
  )
}
