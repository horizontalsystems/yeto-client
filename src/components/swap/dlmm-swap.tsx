'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DlmmSwapForm } from '@/components/swap/dlmm-swap-form'
import { DlmmSwapSkeleton } from '@/components/swap/dlmm-swap-skeleton'

interface Pair {
  address: string
  name: string
  mint_x_url: string
  mint_y_url: string
}

export function DlmmSwap({ poolAddress }: { poolAddress: string }) {
  const [pair, setPair] = useState<Pair>()
  const [formState, setFormState] = useState<{ loading: boolean; error?: string }>({
    loading: true
  })

  useEffect(() => {
    setFormState({ loading: true })
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev-clmm-api/pair/${poolAddress}`)
      .then(res => res.json())
      .then(data => {
        setPair(data)
        setFormState({ loading: false })
      })
      .catch(err => {
        setFormState({ loading: false, error: err.message })
      })
  }, [poolAddress])

  if (!pair || formState.loading) {
    return <DlmmSwapSkeleton />
  }

  return (
    <Tabs defaultValue="swap">
      <TabsList>
        <div className="flex flex-row border-b">
          <TabsTrigger value="swap" className="p-6">
            Swap
          </TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="swap" forceMount>
        <DlmmSwapForm name={pair.name} address={poolAddress} />
      </TabsContent>
    </Tabs>
  )
}
