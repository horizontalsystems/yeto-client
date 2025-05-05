'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn, formatNumber, formatPrice, toPercent } from '@/lib/utils'
import { ArrowUpFromLine, Ellipsis, Plus, X } from 'lucide-react'
import { Pair } from '@/components/dlmm/dlmm'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ButtonClaim } from '@/components/button-claim'

export type Position = {
  address: string
  totalDeposit: string
  unclaimedFee: string
  minPrice: string
  maxPrice: string
  isOutOfRange: boolean
}

export type PoolItemProps = {
  pair: Pair
  positions: Position[]
  onClosePosition: (address: string, positionAddress: string) => Promise<void>
}

export function MyPoolListItem({ pair, positions, onClosePosition }: PoolItemProps) {
  const [showPairs, setShowPairs] = useState(false)

  const totalDeposit = positions.map(a => parseFloat(a.totalDeposit)).reduce((acc, item) => acc + item, 0)
  const totalFee = positions.map(a => parseFloat(a.unclaimedFee)).reduce((acc, item) => acc + item, 0)

  return (
    <div className="border-t">
      <div
        className={cn('flex w-full cursor-pointer', { 'bg-bran': showPairs })}
        onClick={() => setShowPairs(!showPairs)}
      >
        <div className="text-leah flex w-2/4 items-center gap-2 px-6 py-4 font-medium">
          <div className="relative flex min-w-[44px]">
            <img
              src={pair.mint_x.logo_url}
              alt={pair.mint_x.name}
              className="z-10 h-7 w-7 rounded-full ring-2 ring-black"
            />
            <img
              src={pair.mint_y.logo_url}
              alt={pair.mint_y.name}
              className="absolute left-4 h-7 w-7 rounded-full ring-2 ring-black"
            />
          </div>
          <div>
            <div>
              {pair.mint_x.name} / {pair.mint_y.name}
            </div>
            <div>
              <span className="text-sm">
                <span className="text-gray">Bin Step</span>
                <span className="text-leah ms-1">{pair.bin_step}</span>
              </span>
              <span className="ms-2 text-sm">
                <span className="text-gray">Fee</span>
                <span className="text-leah ms-1">{toPercent(pair.base_fee_percentage)}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="w-1/4 px-6 py-4">{formatNumber(totalDeposit)}</div>
        <div className="w-1/4 px-6 py-4">{formatNumber(totalFee)}</div>
        <div className="w-1/4 px-6 py-4">{pair.apr}</div>
        <div className="w-1/4 px-6 py-4">{formatPrice(pair.current_price)}</div>
      </div>

      {showPairs &&
        positions.map(position => (
          <div key={position.address} className="flex border-t">
            <div className="w-2/4 px-6 py-4 font-medium">
              <div className="flex gap-2 align-middle">
                <div className="text-leah">
                  {formatPrice(position.minPrice)} - {formatPrice(position.maxPrice)}
                </div>
                {/*<Badge variant="secondary">Spot</Badge>*/}
                {position.isOutOfRange && <Badge variant="destructive">Out of range</Badge>}
              </div>
            </div>
            <div className="w-1/4 px-6 py-4">{formatNumber(position.totalDeposit)}</div>
            <div className="w-1/4 px-6 py-4">{formatNumber(position.unclaimedFee)}</div>
            <div className="w-1/4 px-6 py-4">{pair.apr}</div>
            <div className="w-1/4 px-6 py-4">
              <div className="flex items-center gap-3">
                <ButtonClaim poolAddress={pair.address} positionAddress={position.address} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <Link href={`/dlmm/new?pool=${pair.address}`}>
                      <DropdownMenuItem>
                        <Plus /> Add liquidity
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/dlmm/${pair.address}/${position.address}/withdraw`}>
                      <DropdownMenuItem>
                        <ArrowUpFromLine /> Withdraw
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => onClosePosition(pair.address, position.address)}>
                      <X /> Close position
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
