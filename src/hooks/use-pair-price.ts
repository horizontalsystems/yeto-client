import { useCallback, useEffect, useState } from 'react'
import { sleep } from '@/lib/utils'

type PairPriceResult = {
  basePrice?: string
  quotePrice?: string
}

type Price = {
  base?: string
  baseMint?: string
  quote?: string
  quoteMint?: string
}

export function usePairPrice(baseMint?: string, quoteMint?: string, refreshInterval = 10000): PairPriceResult {
  const [price, setPrice] = useState<Price>({})

  const syncPrice = useCallback(async (base: string, quote: string) => {
    try {
      const response = await fetch(`https://lite-api.jup.ag/price/v2?ids=${base},${quote}&vsToken=${quote}`)
      if (!response.ok) {
        if (response.status === 429) {
          await sleep(10000)
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json().then(res => {
        return {
          base: res.data[base]?.price,
          quote: res.data[quote]?.price
        }
      })

      setPrice({ ...data, baseMint: base, quoteMint: quote })
    } catch (err) {
      console.log(err)
      await sleep(2000)
    }
  }, [])

  useEffect(() => {
    setPrice({})

    let stopped = false

    const loopFetch = async () => {
      if (!stopped && baseMint && quoteMint) {
        await syncPrice(baseMint, quoteMint)
      }
      if (!stopped) {
        setTimeout(loopFetch, refreshInterval)
      }
    }

    loopFetch()

    return () => {
      stopped = true
    }
  }, [baseMint, quoteMint, refreshInterval, syncPrice])

  return {
    basePrice: price.base,
    quotePrice: price.quote
  }
}
