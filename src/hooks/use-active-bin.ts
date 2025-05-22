import DLMM from '@yeto/dlmm/ts-client'
import { useCallback, useEffect, useState } from 'react'

interface ActiveBin {
  id: number
  price: string
}

export const useActiveBin = (dlmmInstance: Promise<DLMM>, refreshInterval: number = 10000) => {
  const [activeBin, setActiveBin] = useState<ActiveBin>({
    id: 0,
    price: '0'
  })

  const syncActiveBin = useCallback(async () => {
    const pool = await dlmmInstance
    const activeBin = await pool.getActiveBin()
    setActiveBin({ id: activeBin.binId, price: activeBin.price })
  }, [dlmmInstance])

  useEffect(() => {
    let stopped = false

    const loopSync = async () => {
      if (!stopped) {
        await syncActiveBin()
      }
      if (!stopped) {
        setTimeout(loopSync, refreshInterval)
      }
    }

    loopSync()

    return () => {
      stopped = true
    }
  }, [refreshInterval, syncActiveBin])

  return {
    activeBinId: activeBin.id,
    activeBinPrice: activeBin.price,
    syncActiveBin
  }
}
