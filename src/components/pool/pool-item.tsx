'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toAmount, toPercent } from '@/lib/utils'

export type Pair = {
  address: string
  bin_step: number
  liquidity: string
  trade_volume_24h: string
  apr: string
}

export function PoolItem({
  name,
  tvl,
  volume,
  apr,
  pairs
}: {
  name: string
  tvl: number
  volume: number
  apr: number
  pairs: Pair[]
}) {
  const [showPairs, setShowPairs] = useState(false)
  const router = useRouter()

  const head = (
    <tr key={`${name}-head`} className="cursor-pointer border-t" onClick={() => setShowPairs(!showPairs)}>
      <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">
        {name} <span className="ms-2 rounded-2xl bg-[#232323] px-3 py-1">{pairs.length} pools</span>
      </th>
      <td className="px-6 py-4">{toAmount(tvl)}</td>
      <td className="px-6 py-4">{toAmount(volume)}</td>
      <td className="px-6 py-4">{toPercent(apr)}</td>
    </tr>
  )

  let body = null
  if (showPairs) {
    body = pairs.map(pair => (
      <tr key={pair.address} className="cursor-pointer border-t" onClick={() => router.push(`/dlmm/${pair.address}`)}>
        <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">
          <span className="text-muted-foreground ps-5 text-sm">Bin Step {pair.bin_step}</span>
        </th>
        <td className="px-6 py-4">{toAmount(pair.liquidity)}</td>
        <td className="px-6 py-4">{toAmount(pair.trade_volume_24h)}</td>
        <td className="px-6 py-4">{toPercent(pair.apr)}</td>
      </tr>
    ))
  }

  return [head, body]
}
