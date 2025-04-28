'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DlmmWithdrawForm } from '@/components/dlmm/withdraw/dlmm-withdraw-form'
import { DlmmWithdrawSkeleton } from '@/components/dlmm/withdraw/dlmm-withdraw-skeleton'
import { Pair } from '@/components/dlmm/dlmm'

export function DlmmWithdraw({ poolAddress, positionAddress }: { poolAddress: string; positionAddress: string }) {
  const [pair, setPair] = useState<Pair>()
  const [formState, setFormState] = useState<{ loading: boolean; error?: string }>({
    loading: true
  })

  useEffect(() => {
    setFormState({ loading: true })
    const sync = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/dlmm/${poolAddress}`)

      if (!res.ok) {
        return setFormState({ loading: false, error: 'Failed to fetch pair' })
      }

      await res
        .json()
        .then(data => {
          setPair(data)
          setFormState({ loading: false })
        })
        .catch(err => {
          setFormState({ loading: false, error: err.message })
        })
    }
    sync()
  }, [poolAddress])

  if (formState.loading) {
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
        {pair ? (
          <DlmmWithdrawForm pair={pair} poolAddress={poolAddress} positionAddress={positionAddress} />
        ) : (
          <div className="p-6">Pair is not found</div>
        )}
      </TabsContent>
    </Tabs>
  )
}
