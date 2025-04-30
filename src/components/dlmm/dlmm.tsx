'use client'

import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toAmount, toPercent, truncate } from '@/lib/utils'
import { TvlChart } from '@/components/chart/tvl-chart'
import { SwapVolumeChart } from '@/components/chart/swap-volume-chart'
import { DlmmSkeleton } from '@/components/dlmm/dlmm-skeleton'

export type Pair = {
  address: string
  mint_x: {
    address: string
    name: string
    logo_url: string
    decimals: number
  }
  mint_y: {
    address: string
    name: string
    logo_url: string
    decimals: number
  }
  liquidity: string
  apr: string
  bin_step: number
  base_fee_percentage: string
  max_fee_percentage: string
  protocol_fee_percentage: string
  reserve_x_amount: string
  reserve_y_amount: string
  volume: { [key: string]: string }
  fees: { [key: string]: string }
}

export function Dlmm({ address }: { address: string }) {
  const [pair, setPair] = useState<Pair>()

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/dlmm/${address}`)
      .then(res => res.json())
      .then(pair => {
        setPair(pair)
      })
  }, [address])

  if (!pair) {
    return <DlmmSkeleton />
  }

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <Breadcrumb className="mt-10 mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/">Pools</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {pair.mint_x.name}-{pair.mint_y.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-1 flex-col gap-4 pt-0">
        <div className="bg-card w-full rounded-xl p-6 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-0 pb-6">
            <div className="text-foreground flex items-center space-x-2 text-2xl uppercase">
              <div className="flex -space-x-1">
                <img
                  src={pair.mint_x.logo_url}
                  alt={pair.mint_x.name}
                  className="h-8 w-8 rounded-full"
                />
                <img
                  src={pair.mint_y.logo_url}
                  alt={pair.mint_y.name}
                  className="h-8 w-8 rounded-full"
                />
              </div>
              <span>{pair.mint_x.name} / {pair.mint_y.name}</span>
            </div>
            <div className="flex space-x-3">
              <Link href={`/dlmm/swap/${address}`}>
                <Button variant="default" className="cursor-pointer">
                  Swap
                </Button>
              </Link>
              <Link href={`/dlmm/new?pool=${address}`}>
                <Button variant="light" className="cursor-pointer">
                  <Plus /> Add liquidity
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">Total Value Locked</span>
                <span className="text-foreground font-semibold">{toAmount(pair.liquidity)}</span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">Bin Step</span>
                  <span className="ps-2 text-sm text-white">{pair.bin_step}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Base</span>
                  <span className="ps-2 text-sm text-white">{toPercent(pair.base_fee_percentage)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">24H Fee/TVL</span>
                <span className="text-foreground font-semibold">
                  {parseFloat(pair.fees['24h']) / parseFloat(pair.liquidity) || 0}
                </span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">Max Fee</span>
                  <span className="ps-2 text-sm text-white">{toPercent(pair.max_fee_percentage)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Protocol Fee</span>
                  <span className="ps-2 text-sm text-white">{toPercent(pair.protocol_fee_percentage)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">Allocation {pair.mint_x.name}</span>
                <span className="text-foreground font-semibold">{toAmount(pair.reserve_x_amount)}</span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">Dynamic Fee</span>
                  <span className="ps-2 text-sm text-white">0.0023%</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">24H Fee</span>
                  <span className="ps-2 text-sm text-white">{toAmount(pair.fees['24h'])}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">Allocation {pair.mint_y.name}</span>
                <span className="text-foreground font-semibold">{toAmount(pair.reserve_y_amount)}</span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">{pair.mint_x.name}</span>
                  <span className="ps-2 text-sm text-white">{truncate(pair.mint_x.address)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">{pair.mint_y.name}</span>
                  <span className="ps-2 text-sm text-white">{truncate(pair.mint_y.address)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-card aspect-5/2 rounded-xl p-6">
            <div className="flex justify-between">
              <div>
                <div>Total Value Locked</div>
                <div>{toAmount(pair.liquidity)}</div>
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
          <div className="bg-card aspect-5/2 rounded-xl">
            <div className="bg-card aspect-5/2 rounded-xl p-6">
              <div className="flex justify-between">
                <div>
                  <div>Swap Volume</div>
                  <div></div>
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
        </div>
        <div className="bg-card min-h-[100vh] flex-1 rounded-xl p-6 md:min-h-min">Transactions</div>
      </div>
    </div>
  )
}
