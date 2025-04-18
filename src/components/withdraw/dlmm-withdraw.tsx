'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DlmmWithdrawForm } from '@/components/withdraw/dlmm-withdraw-form'
import { DlmmWithdrawSkeleton } from '@/components/withdraw/dlmm-withdraw-skeleton'

interface Pair {
  address: string
  name: string
  mint_x_url: string
  mint_y_url: string
}

export function DlmmWithdraw({ poolAddress, positionAddress }: { poolAddress: string; positionAddress: string }) {
  const [pair, setPair] = useState<Pair>()
  const [formState, setFormState] = useState<{ loading: boolean; error?: string }>({
    loading: true
  })

  useEffect(() => {
    setFormState({ loading: true })
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dev-clmm-api/pair/${poolAddress}`)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        setPair(data)
        setFormState({ loading: false })
      })
      .catch(err => {
        setFormState({ loading: false, error: err.message })
      })
  }, [poolAddress])

  if (!pair || formState.loading) {
    return <DlmmWithdrawSkeleton />
  }

  return (
    <Tabs defaultValue="swap">
      <TabsList>
        <div className="flex flex-row border-b">
          <TabsTrigger value="swap" className="p-6">
            Withdraw
          </TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="swap" forceMount>
        <DlmmWithdrawForm name={pair.name} poolAddress={poolAddress} positionAddress={positionAddress} />
      </TabsContent>
    </Tabs>
  )
}
