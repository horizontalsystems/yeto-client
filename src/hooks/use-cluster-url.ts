import { useMemo } from 'react'
import { clusterApiUrl } from '@solana/web3.js'

export function useClusterUrl(isMainnet: boolean = true) {
  return useMemo(() => (isMainnet ? process.env.NEXT_PUBLIC_RPC_URL : clusterApiUrl('devnet')), [isMainnet])
}
