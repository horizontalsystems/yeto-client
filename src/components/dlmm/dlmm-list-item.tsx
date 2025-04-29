'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn, toAmount, toPercent } from '@/lib/utils'
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
              <div className="md:hidden p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex flex-col">
                    <div className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-sm">
                      <span>Bin Step</span>
                      <span className="text-leah ms-1">{pair.bin_step}</span>
                    </span>
                    <span className="ms-2 text-sm">
                      <span className="text-steel">Fee</span>
                      <span className="text-leah ms-1">{parseFloat(pair.base_fee_percentage) * 100}%</span>
                    </span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Total Liquidity</div>
                      <div className="font-medium">{toAmount(pair.liquidity || 0)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">24h Vol</div>
                      <div className="font-medium">{toAmount(pair.volume['24h'] || 0)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">24h Fee/TVL</div>
                      <div className="font-medium">{toPercent(pair.apr || 0)}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Desktop View */}
              <div className="hidden md:flex w-full items-center">
                <div className="px-6 py-4">{i + 1}</div>
                <div className="w-[40%] px-6 py-4 font-medium flex items-center gap-2">
                  <div>
                    <span className="text-sm">
                      <span>Bin Step</span>
                      <span className="text-leah ms-1">{pair.bin_step}</span>
                    </span>
                    <span className="ms-2 text-sm">
                      <span className="text-steel">Fee</span>
                      <span className="text-leah ms-1">{parseFloat(pair.base_fee_percentage) * 100}%</span>
                    </span>
                  </div>
                </div>
                <div className="w-[20%] px-6 py-4">{toAmount(pair.liquidity || 0)}</div>
                <div className="w-[20%] px-6 py-4">{toAmount(pair.volume['24h'] || 0)}</div>
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
      <div
        className={cn('w-full cursor-pointer', { 'bg-bran': showPairs })}
        onClick={() => setShowPairs(!showPairs)}
      >
        {/* Mobile View */}
        <div className="block md:hidden p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex min-w-[44px]">
              <img 
                src={firstPair.mint_x.logo_url} 
                alt={firstPair.mint_x.name} 
                className="h-7 w-7 rounded-full ring-2 ring-black z-10"
              />
              <img 
                src={firstPair.mint_y.logo_url} 
                alt={firstPair.mint_y.name} 
                className="h-7 w-7 rounded-full ring-2 ring-black absolute left-4"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium">{name}</span>
              <span className="bg-bran rounded-2xl px-2 py-0.5 text-leah self-start whitespace-nowrap">{pairs.length} pools</span>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Total Liquidity</div>
                <div className="font-medium">{toAmount(tvl)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">24h Vol</div>
                <div className="font-medium">{toAmount(volume)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">24h Fee/TVL</div>
                <div className="font-medium">{toPercent(apr)}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Desktop View */}
        <div className="hidden md:flex">
          <div className="text-leah w-[40%] px-6 py-4 font-medium flex items-center gap-2">
            <div className="relative flex min-w-[44px]">
              <img 
                src={firstPair.mint_x.logo_url} 
                alt={firstPair.mint_x.name} 
                className="h-7 w-7 rounded-full ring-2 ring-black z-10"
              />
              <img 
                src={firstPair.mint_y.logo_url} 
                alt={firstPair.mint_y.name} 
                className="h-7 w-7 rounded-full ring-2 ring-black absolute left-4"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>{name}</span>
              <span className="bg-bran rounded-2xl px-3 py-1 whitespace-nowrap">{pairs.length} pools</span>
            </div>
          </div>
          <div className="w-[20%] px-6 py-4">{toAmount(tvl)}</div>
          <div className="w-[20%] px-6 py-4">{toAmount(volume)}</div>
          <div className="w-[20%] px-6 py-4">{toPercent(apr)}</div>
        </div>
      </div>
      {showPairs && renderPairs()}
    </div>
  )
}
