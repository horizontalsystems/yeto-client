'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn, formatUsd, toPercent } from '@/lib/utils'
import { Pair } from '@/components/dlmm/dlmm'

export type PoolItemProps = {
  name: string
  tvl: number
  volume: number
  apr: number
  pairs: Pair[]
}

export function DlmmListItem({ name, tvl, volume, apr, pairs }: PoolItemProps) {
  const [showPairs, setShowPairs] = useState(false)
  const firstPair = pairs[0]

  const renderPairs = () => {
    return (
      <div>
        {pairs.map((pair, i) => (
          <Link key={pair.address} href={`/dlmm/${pair.address}`}>
            <div className="border-t">
              {/* Mobile View */}
              <div className="p-4 md:hidden">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex gap-3 text-sm">
                      <span className="text-sm">
                        <span className="text-gray">Bin Step</span>
                        <span className="text-leah ms-1">{pair.bin_step}</span>
                      </span>
                      <span className="ms-2 text-sm">
                        <span className="text-gray">Fee</span>
                        <span className="text-leah ms-1">{parseFloat(pair.base_fee_percentage) * 100}%</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground text-sm">Total Liquidity</div>
                      <div className="font-medium">{formatUsd(pair.liquidity || 0)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground text-sm">24h Vol</div>
                      <div className="font-medium">{formatUsd(pair.volume['hour_24'] || 0)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground text-sm">APR</div>
                      <div className="font-medium">{toPercent(pair.apr || 0)}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Desktop View */}
              <div className="hidden w-full items-center md:flex">
                <div className="px-6 py-4">{i + 1}</div>
                <div className="flex w-[40%] items-center gap-2 px-6 py-4 font-medium">
                  <div>
                    <span className="text-sm">
                      <span>Bin Step</span>
                      <span className="text-leah ms-1">{pair.bin_step}</span>
                    </span>
                    <span className="ms-2 text-sm">
                      <span className="text-steel">Fee</span>
                      <span className="text-leah ms-1">{toPercent(pair.base_fee_percentage)}</span>
                    </span>
                  </div>
                </div>
                <div className="w-[20%] px-6 py-4">{formatUsd(pair.liquidity || 0)}</div>
                <div className="w-[20%] px-6 py-4">{formatUsd(pair.volume['hour_24'] || 0)}</div>
                <div className="w-[20%] px-6 py-4">{toPercent(pair.apr || 0)}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="border-t">
      <div className={cn('w-full cursor-pointer', { 'bg-bran': showPairs })} onClick={() => setShowPairs(!showPairs)}>
        {/* Mobile View */}
        <div className="block p-4 md:hidden">
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex min-w-[44px]">
              <img
                src={firstPair.mint_x.logo_url}
                alt={firstPair.mint_x.name}
                className="z-10 h-7 w-7 rounded-full ring-2 ring-black"
              />
              <img
                src={firstPair.mint_y.logo_url}
                alt={firstPair.mint_y.name}
                className="absolute left-4 h-7 w-7 rounded-full ring-2 ring-black"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium">{name}</span>
              <span className="bg-bran text-leah self-start rounded-2xl px-2 py-0.5 whitespace-nowrap">
                {pairs.length} pools
              </span>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">Total Liquidity</div>
                <div className="font-medium">{formatUsd(tvl)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">24h Vol</div>
                <div className="font-medium">{formatUsd(volume)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">APR</div>
                <div className="font-medium">{toPercent(apr)}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Desktop View */}
        <div className="hidden md:flex">
          <div className="text-leah flex w-[40%] items-center gap-2 px-6 py-4 font-medium">
            <div className="relative flex min-w-[44px]">
              <img
                src={firstPair.mint_x.logo_url}
                alt={firstPair.mint_x.name}
                className="z-10 h-7 w-7 rounded-full ring-2 ring-black"
              />
              <img
                src={firstPair.mint_y.logo_url}
                alt={firstPair.mint_y.name}
                className="absolute left-4 h-7 w-7 rounded-full ring-2 ring-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>{name}</span>
              <span className="bg-bran rounded-2xl px-3 py-1 whitespace-nowrap">{pairs.length} pools</span>
            </div>
          </div>
          <div className="w-[20%] px-6 py-4">{formatUsd(tvl)}</div>
          <div className="w-[20%] px-6 py-4">{formatUsd(volume)}</div>
          <div className="w-[20%] px-6 py-4">{toPercent(apr)}</div>
        </div>
      </div>
      {showPairs && renderPairs()}
    </div>
  )
}
