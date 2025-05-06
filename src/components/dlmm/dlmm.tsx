'use client'

import Decimal from 'decimal.js'
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
import { formatPrice, formatUsd, toPercent, truncate } from '@/lib/utils'
import { DlmmSkeleton } from '@/components/dlmm/dlmm-skeleton'
import { PriceChart } from '@/components/chart/price-chart'
import { TradingVolumeChart } from '@/components/chart/trading-volume-chart'
import { DlmmTransactions } from '@/components/dlmm/dlmm-transactions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MyPoolList } from '@/components/my-board/my-pool-list'

export type Pair = {
  address: string
  current_price: string
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

  let feeTvlRatio = new Decimal(0)
  if (pair.fees['hour_24'] && pair.liquidity) {
    feeTvlRatio = new Decimal(pair.fees['hour_24'] || 0).div(new Decimal(pair.liquidity || 0))
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
          <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:justify-between sm:gap-0">
            <div className="text-foreground flex items-center space-x-2 text-2xl uppercase">
              <div className="flex -space-x-1">
                <img src={pair.mint_x.logo_url} alt={pair.mint_x.name} className="h-8 w-8 rounded-full" />
                <img src={pair.mint_y.logo_url} alt={pair.mint_y.name} className="h-8 w-8 rounded-full" />
              </div>
              <span>
                {pair.mint_x.name} / {pair.mint_y.name}
              </span>
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
                <span className="text-foreground font-semibold">{formatUsd(pair.liquidity)}</span>
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
                <span className="text-foreground font-semibold">{toPercent(feeTvlRatio.toString())}</span>
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
                <span className="text-foreground font-semibold">
                  {formatPrice(new Decimal(pair.reserve_x_amount).div(10 ** pair.mint_x.decimals || 0))}
                </span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">Dynamic Fee</span>
                  <span className="ps-2 text-sm text-white">0.0023%</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">24H Fee</span>
                  <span className="ps-2 text-sm text-white">{formatUsd(pair.fees['hour_24'])}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">Allocation {pair.mint_y.name}</span>
                <span className="text-foreground font-semibold">
                  {formatPrice(new Decimal(pair.reserve_y_amount).div(10 ** pair.mint_y.decimals || 0))}
                </span>
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
          <PriceChart
            poolAddress={address}
            currentPrice={formatPrice(pair.current_price) + ' ' + pair.mint_x.name + '/' + pair.mint_y.name}
          />
          <TradingVolumeChart poolAddress={address} volume24h={formatUsd(pair.volume['hour_24'])} />
        </div>
        <div className="bg-card mb-10 rounded-xl">
          <Tabs defaultValue="transactions" defaultChecked>
            <TabsList>
              <div className="flex flex-row border-b">
                <TabsTrigger value="transactions" className="p-6">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="my-positions" className="p-6">
                  My positions
                </TabsTrigger>
              </div>
            </TabsList>
            <TabsContent value="transactions" forceMount>
              <DlmmTransactions address={address} />
            </TabsContent>
            <TabsContent value="my-positions" forceMount>
              <MyPoolList poolAddress={pair.address} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
