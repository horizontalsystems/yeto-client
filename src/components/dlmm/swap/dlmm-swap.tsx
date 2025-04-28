'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DlmmSwapForm } from '@/components/dlmm/swap/dlmm-swap-form'
import { DlmmSwapSkeleton } from '@/components/dlmm/swap/dlmm-swap-skeleton'
import { Pair } from '@/components/dlmm/dlmm'

interface DlmmSwapProps {
  poolAddress: string
}

export function DlmmSwap({ poolAddress }: DlmmSwapProps) {
  const [formState, setFormState] = useState<{ loading: boolean; error?: string; pair?: Pair }>({
    loading: true
  })

  useEffect(() => {
    setFormState({ loading: true })

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/dlmm/${poolAddress}`)
      .then(res => res.json())
      .then(data => {
        setFormState({ loading: false, pair: data })
      })
      .catch(err => {
        setFormState({ loading: false, error: err.message })
      })
  }, [poolAddress])

  if (formState.loading || !formState.pair) {
    return <DlmmSwapSkeleton />
  }

  const pair = formState.pair

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
        <DlmmSwapForm address={pair.address} mint_x={pair.mint_x} mint_y={pair.mint_y} />
      </TabsContent>
    </Tabs>
  )
}
