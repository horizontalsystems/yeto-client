'use client'

import { useQuery } from '@tanstack/react-query'
import { getPoolTransactions } from '@/lib/api'
import { cn, formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'

export type Transaction = {
  signature: string
  type: string
  amount_usdc: string
  amount_in: {
    amount: string
    token_logo: string
  }
  amount_out: {
    amount: string
    token_logo: string
  }
  start_price: string
  end_price: string
  time: string
}

export function DlmmTransactions({ address }: { address: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => getPoolTransactions(address)
  })

  if (isError) return <p className="text-red-500">There was an error fetching transactions.</p>
  if (isLoading) {
    return <TransactionsSkeleton />
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="text-gray text-sm">
        <div className="flex w-full">
          <div className="w-2/5 px-6 py-3">Action</div>
          <div className="w-1/5 px-6 py-3">From</div>
          <div className="w-1/5 px-6 py-3">To</div>
          <div className="w-1/5 px-6 py-3">Price</div>
          <div className="w-1/5 px-6 py-3">Time</div>
        </div>
        {data.map((item: Transaction, index: number) => {
          return (
            <div key={index} className="flex w-full items-center border-t">
              <div
                className={cn('flex w-2/5 items-center gap-2 px-6 py-3', {
                  'text-green': item.type.startsWith('Buy'),
                  'text-sunset': item.type.startsWith('Sell')
                })}
              >
                <span>{item.type}</span>
                <a className="text-blue-400" target="_blank" href={`https://solscan.io/tx/${item.signature}`}>
                  <ExternalLink size="18" />
                </a>
              </div>
              <div className="flex w-1/5 items-center gap-2 px-6 py-3">
                {formatPrice(item.amount_in.amount)}
                <img src={item.amount_in.token_logo} alt="" className="h-7 w-7 rounded-full" />
              </div>
              <div className="flex w-1/5 items-center gap-2 px-6 py-3">
                {formatPrice(item.amount_out.amount)}
                <img src={item.amount_out.token_logo} alt="" className="h-7 w-7 rounded-full" />
              </div>
              <div className="w-1/5 px-6 py-3">
                {formatPrice(item.start_price)}-{formatPrice(item.end_price)}
              </div>
              <div className="w-1/5 px-6 py-3">{new Date(item.time).toLocaleDateString()}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TransactionsSkeleton() {
  return Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className={cn('flex items-center justify-between p-6', { 'border-t': i !== 0 })}>
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-6 w-1/6" />
      <Skeleton className="h-6 w-1/6" />
      <Skeleton className="h-6 w-1/6" />
    </div>
  ))
}
