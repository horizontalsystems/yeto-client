import DLMM from '@yeto/dlmm/ts-client'
import { useCallback, useEffect, useState } from 'react'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { SOL_TOKEN_MINT } from '@/lib/constants'

interface TokenBalances {
  balanceX: number
  balanceY: number
}

export function useTokensBalances(
  conn: Connection,
  dlmmInstance: Promise<DLMM>,
  walletPubKey: PublicKey | null,
  refreshInterval: number = 10000
) {
  const [balances, setBalances] = useState<TokenBalances>({ balanceX: 0, balanceY: 0 })
  const [loading, setLoading] = useState<boolean>(false)

  const getBalance = useCallback(
    async (walletPubKey: PublicKey, tokenPubkey: PublicKey) => {
      try {
        if (tokenPubkey.toBase58() === SOL_TOKEN_MINT) {
          const lamports = await conn.getBalance(walletPubKey, 'confirmed')
          return lamports / LAMPORTS_PER_SOL
        }

        const ata = getAssociatedTokenAddressSync(tokenPubkey, walletPubKey!)
        const tokenBalance = await conn.getTokenAccountBalance(ata, 'confirmed')
        return tokenBalance.value.uiAmount || 0
      } catch {
        return 0
      }
    },
    [conn]
  )

  const syncBalances = useCallback(
    async (dlmmInstance: Promise<DLMM>, walletPubKey: PublicKey) => {
      setLoading(true)
      try {
        const dlmmPool = await dlmmInstance
        const [balanceX, balanceY] = await Promise.all([
          getBalance(walletPubKey, dlmmPool.tokenX.publicKey),
          getBalance(walletPubKey, dlmmPool.tokenY.publicKey)
        ])
        setBalances({ balanceX, balanceY })
      } finally {
        setLoading(false)
      }
    },
    [getBalance]
  )

  useEffect(() => {
    let stopped = false

    const loopSync = async () => {
      if (!stopped && walletPubKey) {
        await syncBalances(dlmmInstance, walletPubKey)
      }
      if (!stopped) {
        setTimeout(loopSync, refreshInterval)
      }
    }

    loopSync()

    return () => {
      stopped = true
    }
  }, [dlmmInstance, refreshInterval, walletPubKey, syncBalances])

  return { balances, loading, refresh: syncBalances }
}
