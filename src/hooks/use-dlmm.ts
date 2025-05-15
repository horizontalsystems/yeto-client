'use client'

import DLMM from '@yeto/dlmm/ts-client'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@/hooks/use-connection'

export function useDlmm(poolAddress: string) {
  const connection = useConnection()
  const dlmmInstance = useMemo(() => DLMM.create(connection, new PublicKey(poolAddress)), [connection, poolAddress])

  return {
    connection,
    dlmmInstance
  }
}
