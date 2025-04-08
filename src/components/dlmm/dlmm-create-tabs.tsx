'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DlmmCreatePool } from '@/components/dlmm/dlmm-create-pool'
import { DlmmAddLiquidity } from '@/components/dlmm/dlmm-add-liquidity'
import { DlmmAddLiquiditySkeleton } from '@/components/dlmm/dlmm-add-liquidity-skeleton'

interface Pair {
  address: string
  name: string
  mint_x: string
  mint_x_url: string
  mint_y: string
  mint_y_url: string
}

export function DlmmCreateTabs({ poolAddress: address }: { poolAddress?: string }) {
  const [tab, setTab] = useState(address ? 'liquidity' : 'pool')
  const [poolAddress, setPoolAddress] = useState<string | undefined>(address)
  const [pair, setPair] = useState<Pair>()
  const [liqState, setLiqState] = useState<{ loading: boolean; error?: string }>({
    loading: !!address
  })

  useEffect(() => {
    setLiqState({ loading: true })
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev-clmm-api/pair/${poolAddress}`)
      .then(res => res.json())
      .then(data => {
        setPair(data)
        setLiqState({ loading: false })
      })
      .catch(err => {
        setLiqState({ loading: false, error: err.message })
      })
  }, [poolAddress])

  const renderLiqTab = () => {
    if (liqState.loading) {
      return <DlmmAddLiquiditySkeleton />
    }

    return pair ? (
      <DlmmAddLiquidity
        address={pair.address}
        name={pair.name}
        mintX={pair.mint_x}
        mintY={pair.mint_y}
        mintXUrl={pair.mint_x_url}
        mintYUrl={pair.mint_y_url}
      />
    ) : (
      'Pair not found'
    )
  }

  const onCreatePool = (address: string) => {
    console.log(address)
  }

  const onClickNext = (address: string) => {
    setPoolAddress(address)
    setTab('liquidity')
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
        <DlmmCreatePool onCreate={onCreatePool} onClickNext={onClickNext} />
      </TabsContent>
      <TabsContent value="liquidity" forceMount>
        {renderLiqTab()}
      </TabsContent>
    </Tabs>
  )
}
