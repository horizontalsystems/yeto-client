'use client'

import Link from 'next/link'
import Decimal from 'decimal.js'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import { SearchInput } from '@/components/dlmm/dlmm-search-input'
import { DlmmListItem } from '@/components/dlmm/dlmm-list-item'
import { Button } from '@/components/ui/button'
import { DlmmListSkeleton } from '@/components/dlmm/dlmm-list-skeleton'
import { Pair } from '@/components/dlmm/dlmm'
import { getPools } from '@/lib/api'

export type Pool = {
  name: string
  pairs: Pair[]
}

export function DlmmList() {
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(0)
  const limit = 20

  const queryClient = useQueryClient()
  const pathname = usePathname()
  const pathPrevRef = useRef<string | null>(null)

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['pools', searchText, page],
    queryFn: () => getPools(searchText, page, limit)
  })

  useEffect(() => {
    if (pathPrevRef.current === '/dlmm/new') {
      queryClient.refetchQueries({ queryKey: ['pools', searchText, page] })
    }
    pathPrevRef.current = pathname
  }, [page, pathname, queryClient, searchText])

  const onHandleSearch = useDebouncedCallback((value: string) => {
    setPage(0)
    setSearchText(value)
  }, 300)

  if (isError) return <p className="text-red-500">There was an error fetching pools.</p>
  if (isLoading && !searchText.length) {
    return <DlmmListSkeleton withSearchInput />
  }

  const hasNextPage = data?.length === limit

  return (
    <div className="mb-10 flex flex-col overflow-hidden rounded-3xl border">
      <div className="bg-card flex space-x-2 p-6">
        <SearchInput onChangeValue={onHandleSearch} />
        <Link href="/dlmm/new">
          <Button variant="light" className="cursor-pointer">
            <Plus /> Create Pool
          </Button>
        </Link>
      </div>

      {isFetching ? (
        <DlmmListSkeleton withSearchInput={false} />
      ) : (
        <>
          <div className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <div className="text-gray bg-card hidden w-full border-t text-xs md:flex">
              <div className="w-[40%] px-6 py-3 font-medium">Pool</div>
              <div className="w-[20%] px-6 py-3 font-medium">TVL</div>
              <div className="w-[20%] px-6 py-3 font-medium">24h Vol</div>
              <div className="w-[20%] px-6 py-3 font-medium">APR</div>
            </div>
            {data.map((pool: Pool, index: number) => {
              let tvl = new Decimal(0)
              let volume = new Decimal(0)
              let apr = new Decimal(0)
              const pairs: Pair[] = []
              const poolPairs = pool.pairs || []

              poolPairs.forEach(pair => {
                tvl = tvl.add(new Decimal(pair.liquidity || 0))
                volume = volume.add(new Decimal(pair.volume['hour_24'] || 0))
                apr = apr.add(new Decimal(pair.apr || 0))
                pairs.push(pair)
              })

              return <DlmmListItem key={index} name={pool.name} tvl={tvl} volume={volume} apr={apr} pairs={pairs} />
            })}
          </div>

          <div className="bg-card flex items-center justify-between border-t p-4">
            <Button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0} variant="outline">
              Previous
            </Button>
            <span>Page {page + 1}</span>
            <Button
              onClick={() => setPage(prev => (hasNextPage ? prev + 1 : prev))}
              disabled={!hasNextPage}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
