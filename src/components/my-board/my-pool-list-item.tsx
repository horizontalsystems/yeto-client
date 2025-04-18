'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export type Pair = {
  address: string
}

export type PoolItemProps = {
  name: string
  poolAddress: string
  pairs: Pair[]
}

export function MyPoolListItem({ name, poolAddress, pairs }: PoolItemProps) {
  const [showPairs, setShowPairs] = useState(false)

  const renderPairs = () => {
    return (
      <div>
        <div className="text-andy flex">
          <div className="px-6 py-3">#</div>
          <div className="w-1/4 px-6 py-3">Positions</div>
        </div>
        {pairs.map((position, i) => (
          <Link key={position.address} href={`/dlmm/${poolAddress}/${position.address}`}>
            <div className="flex cursor-pointer border-t">
              <div className="px-6 py-4">{i + 1}</div>
              <div className="w-1/4 px-6 py-4 font-medium">
                <span className="text-sm">
                  <span className="">Bin Step</span>
                  <span className="text-leah ms-1">0</span>
                </span>
                <span className="ms-3 text-sm">
                  <span className="text-steel">Fee</span>
                  <span className="text-leah ms-1">0%</span>
                </span>
              </div>
              <div className="w-1/4 px-6 py-4">0</div>
              <div className="w-1/4 px-6 py-4">0</div>
              <div className="w-1/4 px-6 py-4">0</div>
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
          <span className="bg-bran ms-2 rounded-2xl px-3 py-1 break-keep">{pairs.length} positions</span>
        </div>
        <div className="w-1/4 px-6 py-4">tvl</div>
        <div className="w-1/4 px-6 py-4">volume</div>
        <div className="w-1/4 px-6 py-4">apr</div>
      </div>
      {showPairs && renderPairs()}
    </div>
  )
}
