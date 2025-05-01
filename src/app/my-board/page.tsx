'use client'

import { MyPoolList } from '@/components/my-board/my-pool-list'
import { DepositChart } from '@/components/chart/deposit-chart'
import { StatsCard } from '@/components/my-board/stats-card'
import { EarningsChart } from '@/components/chart/earnings-chart'

export default function MyBoard() {
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div className="mt-6 flex flex-1 flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <EarningsChart />
          <div className="bg-card rounded-xl p-5">
            <DepositChart
              totalDeposit={15000.0}
              sections={[
                { percentage: 30, pairName: 'ETH/USDC' },
                { percentage: 35, pairName: 'BTC/USDC' },
                { percentage: 25, pairName: 'SOL/USDC' },
                { percentage: 10, pairName: 'SOL/BONK' }
              ]}
            />
          </div>
          <div className="bg-card rounded-xl p-5">
            <StatsCard unclaimedFee={20.3} impermanentLoss={926.32} averageApr={12.5} aprChange={-2.5} />
          </div>
        </div>
        <MyPoolList />
      </div>
    </div>
  )
}
