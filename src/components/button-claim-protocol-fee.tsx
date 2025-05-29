'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { linkToSolscan } from '@/lib/ui-utils'
import { useDlmm } from '@/hooks/use-dlmm'

export function ButtonClaimProtocolFee({ poolAddress }: { poolAddress: string }) {
  const { publicKey: walletPubKey, connected, sendTransaction } = useWallet()
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const [protocolFee, setProtocolFee] = useState({
    amountX: 0,
    amountY: 0,
    loading: true
  })

  const adminAddress = process.env.NEXT_PUBLIC_ADMIN
  const { connection, dlmmInstance } = useDlmm(poolAddress)

  const handleClaim = async () => {
    if (!walletPubKey || !connected) {
      return console.error('Wallet not connected')
    }

    if (!adminAddress) {
      return console.error('Admin address is empty')
    }

    setFormState({ submitting: true })

    try {
      const dlmmPool = await dlmmInstance
      const amountX = dlmmPool.lbPair.protocolFee.amountX
      const amountY = dlmmPool.lbPair.protocolFee.amountY

      if (amountX.toNumber() <= 0 && amountY.toNumber() <= 0) {
        toast.error('No fee to claim', { duration: 5000 })
        return setFormState({ submitting: false })
      }

      const claimFeeTx = await dlmmPool.withdrawProtocolFee({
        walletToReceiveFee: new PublicKey(adminAddress),
        amountX: amountX,
        amountY: amountY,
        user: walletPubKey
      })

      if (!claimFeeTx) {
        setFormState({ submitting: false })
        return toast.success('No fee to claim', { duration: 5000 })
      }

      sendTransaction(claimFeeTx, connection)
        .then(signature => {
          setFormState({ submitting: false })
          toast.success('Claim fee complete', {
            duration: 5000,
            description: linkToSolscan(signature)
          })
        })
        .catch(e => {
          console.error(e)
          setFormState({ submitting: false, error: e.message })
          toast.error('Claim fee failed', { description: e.message })
        })
    } catch (e) {
      console.log(e)
      let error = 'Claim fee failed'
      if (e instanceof Error) error = e.message
      setFormState({ submitting: false, error })
      toast.error('Claim fee failed', { description: error })
    }
  }

  const syncProtocolFee = async () => {
    setProtocolFee({ amountX: 0, amountY: 0, loading: true })

    const dlmmPool = await dlmmInstance
    const amountX = dlmmPool.lbPair.protocolFee.amountX
    const amountY = dlmmPool.lbPair.protocolFee.amountY

    setProtocolFee({
      amountX: amountX.toNumber() / 10 ** dlmmPool.tokenX.decimal,
      amountY: amountY.toNumber() / 10 ** dlmmPool.tokenY.decimal,
      loading: false
    })
  }

  useEffect(() => {
    syncProtocolFee()
  }, [poolAddress])

  if (!walletPubKey || walletPubKey.toBase58() !== adminAddress || protocolFee.loading) {
    return null
  }

  return (
    <Button
      variant="light"
      className="cursor-pointer"
      onClick={handleClaim}
      disabled={formState.submitting || (protocolFee.amountX <= 0 && protocolFee.amountY <= 0)}
    >
      Claim Protocol Fee
    </Button>
  )
}
