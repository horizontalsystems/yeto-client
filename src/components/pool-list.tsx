import Link from 'next/link'
import { SearchInput } from '@/components/pool-search-input'
import { Pair, PoolItem } from '@/components/pool-item'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

type Pool = {
  name: string
  pairs: Pair[]
}

export async function PoolList({ query }: { query?: string }) {
  let apiUrl = `${process.env.NEXT_SERVER_API_URL}/clmm-api/pair/all_by_groups?page=0&limit=10&unknown=true&sort_key=volume&order_by=desc`
  if (query) {
    apiUrl += `&search_term=${encodeURIComponent(query)}`
  }

  const res = await fetch(apiUrl)
  if (!res.ok) {
    return 'There was an error'
  }

  const pools: Pool[] = await res.json().then(r => r.groups)

  return (
    <div className="mb-10 flex flex-col overflow-hidden rounded-3xl border">
      <div className="bg-card flex space-x-2 p-6">
        <SearchInput />
        <Link href="/dlmm/pool-creation">
          <Button variant="light" className="cursor-pointer">
            <Plus /> Create Pool
          </Button>
        </Link>
      </div>

      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <thead className="text-gray bg-card border-t text-xs">
          <tr>
            <th scope="col" className="px-6 py-3">
              Pool
            </th>
            <th scope="col" className="px-6 py-3">
              TVL
            </th>
            <th scope="col" className="px-6 py-3">
              24h Vol
            </th>
            <th scope="col" className="px-6 py-3">
              24h Fee/TVL
            </th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool: Pool, index: number) => {
            let tvl = 0
            let volume = 0
            let apr = 0 // max apr

            const pairs: Pair[] = []

            for (let i = 0; i < pool.pairs.length; i += 1) {
              const pair = pool.pairs[i]
              tvl += parseFloat(pair.liquidity)
              volume += parseFloat(pair.trade_volume_24h)
              apr += parseFloat(pair.apr)
              pairs.push(pair)
            }

            return <PoolItem key={index} name={pool.name} tvl={tvl} volume={volume} apr={apr} pairs={pairs} />
          })}
        </tbody>
      </table>
    </div>
  )
}
