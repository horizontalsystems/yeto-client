'use client'

import { TvlChart } from '@/components/chart/tvl-chart'
import { Button } from '@/components/ui/button'
import { MyPoolList } from '@/components/my-board/my-pool-list'
import { DepositChart } from '@/components/chart/deposit-chart'
import { StatsCard } from '@/components/my-board/stats-card'

export default function MyBoard() {
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
          <DepositChart 
            totalDeposit={15000.00}
            sections={[
              { percentage: 30, pairName: 'ETH/USDC' },
              { percentage: 35, pairName: 'BTC/USDC' },
              { percentage: 25, pairName: 'SOL/USDC' },
              { percentage: 10, pairName: 'SOL/BONK' },
            ]}
          />
          </div>
          <div className="bg-card rounded-xl p-5">
          <StatsCard 
            unclaimedFee={20.30}
            impermanentLoss={926.32}
            averageApr={12.5}
            aprChange={-2.5}
          />
          </div>
        </div>
        <MyPoolList />
      </div>
    </div>
  )
}
