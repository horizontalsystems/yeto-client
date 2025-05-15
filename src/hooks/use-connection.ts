import { useMemo } from 'react'
import { Connection } from '@solana/web3.js'
import { useClusterUrl } from '@/hooks/use-cluster-url'

export function useConnection() {
  const endpoint = useClusterUrl()
  return useMemo(() => new Connection(endpoint), [endpoint])
}
