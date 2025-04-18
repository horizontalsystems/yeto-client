'use client'

import Link from 'next/link'
import DLMM from '@meteora-ag/dlmm'
import { Plus } from 'lucide-react'
import { SearchInput } from '@/components/pool/pool-search-input'
import { Button } from '@/components/ui/button'
import { PoolListSkeleton } from '@/components/pool/pool-list-skeleton'
import { useEffect, useMemo, useState } from 'react'
import { clusterApiUrl, Connection } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { MyPoolListItem, PoolItemProps } from '@/components/my-board/my-pool-list-item'

export function MyPoolList() {
  const { publicKey: walletPubKey } = useWallet()
  const [pools, setPools] = useState<PoolItemProps[]>([])

  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const connection = useMemo(() => new Connection(endpoint), [endpoint])

  useEffect(() => {
    if (!walletPubKey) {
      return
    }
    const sync = async () => {
      const pairs = await DLMM.getAllLbPairPositionsByUser(connection, walletPubKey, {
        cluster: 'devnet'
      })

      const items: PoolItemProps[] = []

      pairs.forEach(pair => {
        items.push({
          name: 'ABC-EFG',
          poolAddress: pair.publicKey.toBase58(),
          pairs: pair.lbPairPositionsData.map(positionInfo => {
            return {
              address: positionInfo.publicKey.toBase58()
            }
          })
        })
      })

      setPools(items)
    }

    sync()
  }, [connection, walletPubKey])

  if (!pools.length) {
    return <PoolListSkeleton />
  }

  return (
    <div className="mb-10 flex flex-col overflow-hidden rounded-3xl border">
      <div className="bg-card flex space-x-2 p-6">
        <SearchInput />
        <Link href="/dlmm/create">
          <Button variant="light" className="cursor-pointer">
            <Plus /> Create Pool
          </Button>
        </Link>
      </div>

      <div className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <div className="text-gray bg-card flex w-full border-t text-xs">
          <div className="w-1/4 px-6 py-3 font-medium">Pool</div>
          <div className="w-1/4 px-6 py-3 font-medium">TVL</div>
          <div className="w-1/4 px-6 py-3 font-medium">24h Vol</div>
          <div className="w-1/4 px-6 py-3 font-medium">24h Fee/TVL</div>
        </div>
        {pools.map((pool, index: number) => {
          return <MyPoolListItem key={index} name={pool.name} poolAddress={pool.poolAddress} pairs={pool.pairs} />
        })}
      </div>
    </div>
  )
}
