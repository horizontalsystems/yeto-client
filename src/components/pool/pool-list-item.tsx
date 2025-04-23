'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn, toAmount, toPercent } from '@/lib/utils'
import { Pair } from '@/components/dlmm/dlmm-page'

export type PoolItemProps = {
  name: string
  tvl: number
  volume: number
  apr: number
  pairs: Pair[]
}

export function PoolListItem({ name, tvl, volume, apr, pairs }: PoolItemProps) {
  const [showPairs, setShowPairs] = useState(false)

  const renderPairs = () => {
    return (
      <div>
        <div className="text-andy flex">
          <div className="px-6 py-3">#</div>
          <div className="w-1/4 px-6 py-3">Pools</div>
        </div>
        {pairs.map((pair, i) => (
          <Link key={pair.address} href={`/dlmm/${pair.address}`} className="">
            <div className="flex cursor-pointer border-t">
              <div className="px-6 py-4">{i + 1}</div>
              <div className="w-1/4 px-6 py-4 font-medium">
                <span className="text-sm">
                  <span className="">Bin Step</span>
                  <span className="text-leah ms-1">{pair.bin_step}</span>
                </span>
                <span className="ms-3 text-sm">
                  <span className="text-steel">Fee</span>
                  <span className="text-leah ms-1">{parseFloat(pair.base_fee_percentage) * 100}%</span>
                </span>
              </div>
              <div className="w-1/4 px-6 py-4">{toAmount(pair.liquidity || 0)}</div>
              <div className="w-1/4 px-6 py-4">{toAmount(pair.volume['24h'] || 0)}</div>
              <div className="w-1/4 px-6 py-4">{toPercent(pair.apr || 0)}</div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="border-t">
      <div
        className={cn('flex w-full cursor-pointer', { 'bg-bran': showPairs })}
        onClick={() => setShowPairs(!showPairs)}
      >
        <div className="text-leah w-1/4 px-6 py-4 font-medium">
          <span>{name}</span>
          <span className="bg-bran ms-2 rounded-2xl px-3 py-1 break-keep">{pairs.length} pools</span>
        </div>
        <div className="w-1/4 px-6 py-4">{toAmount(tvl)}</div>
        <div className="w-1/4 px-6 py-4">{toAmount(volume)}</div>
        <div className="w-1/4 px-6 py-4">{toPercent(apr)}</div>
      </div>
      {showPairs && renderPairs()}
    </div>
  )
}
