'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DlmmCreatePool } from '@/components/dlmm/new/dlmm-create-pool'
import { DlmmAddLiquidity } from '@/components/dlmm/new/dlmm-add-liquidity'
import { DlmmAddLiquiditySkeleton } from '@/components/dlmm/new/dlmm-add-liquidity-skeleton'
import { sleep } from '@/lib/utils'
import { Pair } from '@/components/dlmm/dlmm'

export function DlmmNew({ poolAddress: address }: { poolAddress?: string }) {
  const [tab, setTab] = useState(address ? 'liquidity' : 'pool')
  const [poolAddress, setPoolAddress] = useState<string | undefined>(address)
  const [pair, setPair] = useState<Pair>()
  const [liqState, setLiqState] = useState<{ loading: boolean; error?: string }>({
    loading: !!address
  })

  const fetchPair = async (addr: string, retry: number = 3): Promise<void> => {
    setLiqState({ loading: true })

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/dlmm/${addr}`)
      if (!res.ok) {
        if (retry < 3) {
          await sleep(1000)
          return await fetchPair(addr, retry + 1)
        } else {
          return setLiqState({ loading: false, error: 'Error fetching pair' })
        }
      }
      const data = await res.json()
      setPair(data)
      setLiqState({ loading: false })
    } catch (err) {
      console.log(err)
      if (retry < 3) {
        await sleep(1000)
        return await fetchPair(addr, retry + 1)
      } else {
        setLiqState({ loading: false, error: 'Unknown error' })
      }
    }
  }

  useEffect(() => {
    if (poolAddress) {
      fetchPair(poolAddress).catch(console.log)
    }
  }, [])

  const renderLiqTab = () => {
    if (liqState.loading) {
      return <DlmmAddLiquiditySkeleton />
    }

    return pair && pair.address ? (
      <DlmmAddLiquidity pair={pair} />
    ) : (
      <div className="mx-auto w-full p-6">
        Pair not found or not created yet <Link href={`/dlmm/create?pool=${poolAddress}`}></Link>
      </div>
    )
  }

  const onCreatePool = (address: string) => {
    console.log(address)
  }

  const onClickNext = (address: string) => {
    setPoolAddress(address)
    fetchPair(address, 1).then(() => {
      setTab('liquidity')
    })
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <div className="flex flex-row border-b">
          <TabsTrigger value="pool" className="p-6">
            1. Pool Creation
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="p-6" disabled={!poolAddress}>
            2. Adding liquidity
          </TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="pool" forceMount>
        <DlmmCreatePool onCreate={onCreatePool} onClickNext={onClickNext} fetchingPair={liqState.loading} />
      </TabsContent>
      <TabsContent value="liquidity" forceMount>
        {renderLiqTab()}
      </TabsContent>
    </Tabs>
  )
}
