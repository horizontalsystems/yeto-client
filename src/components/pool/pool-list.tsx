'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { SearchInput } from '@/components/pool/pool-search-input'
import { PoolListItem } from '@/components/pool/pool-list-item'
import { Button } from '@/components/ui/button'
import { PoolListSkeleton } from '@/components/pool/pool-list-skeleton'
import { Pair } from '../dlmm/dlmm-page'
import { getPools } from '@/lib/api'

export type Pool = {
  name: string
  pairs: Pair[]
}

export function PoolList() {
  const [searchText, setSearchText] = useState('')

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['posts', searchText],
    queryFn: () => getPools(searchText)
  })

  const onHandleSearch = useDebouncedCallback((value: string) => {
    setSearchText(value)
  }, 300)

  if (isError) return <p className="text-red-500">There was an error fetching pools.</p>
  if (isLoading && !searchText.length) {
    return <PoolListSkeleton withSearchInput />
  }

  return (
    <div className="mb-10 flex flex-col overflow-hidden rounded-3xl border">
      <div className="bg-card flex space-x-2 p-6">
        <SearchInput onChangeValue={onHandleSearch} />
        <Link href="/dlmm/create">
          <Button variant="light" className="cursor-pointer">
            <Plus /> Create Pool
          </Button>
        </Link>
      </div>

      {isFetching ? (
        <PoolListSkeleton withSearchInput={false} />
      ) : (
        <div className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <div className="text-gray bg-card flex w-full border-t text-xs">
            <div className="w-1/4 px-6 py-3 font-medium">Pool</div>
            <div className="w-1/4 px-6 py-3 font-medium">TVL</div>
            <div className="w-1/4 px-6 py-3 font-medium">24h Vol</div>
            <div className="w-1/4 px-6 py-3 font-medium">24h Fee/TVL</div>
          </div>
          {data.map((pool: Pool, index: number) => {
            let tvl = 0
            let volume = 0
            let apr = 0 // max apr

            const pairs: Pair[] = []

            for (let i = 0; i < pool.pairs.length; i += 1) {
              const pair = pool.pairs[i]
              tvl += parseFloat(pair.liquidity) || 0
              volume += parseFloat(pair.volume['24h']) || 0
              apr += parseFloat(pair.apr) || 0
              pairs.push(pair)
            }

            return <PoolListItem key={index} name={pool.name} tvl={tvl} volume={volume} apr={apr} pairs={pairs} />
          })}
        </div>
      )}
    </div>
  )
}
