'use client'

import DLMM from '@yeto/dlmm/ts-client'
import { useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { linkToSolscan } from '@/lib/ui-utils'

export function ButtonClaim({ poolAddress, positionAddress }: { poolAddress: string; positionAddress: string }) {
  const { publicKey: walletPubKey, connected, sendTransaction } = useWallet()
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const connection = useMemo(() => new Connection(endpoint), [endpoint])
  const dlmmInstance = useMemo(() => DLMM.create(connection, new PublicKey(poolAddress)), [connection, poolAddress])

  const handleClaim = async () => {
    if (!walletPubKey || !connected) {
      return console.error('Wallet not connected')
    }

    setFormState({ submitting: true })

    try {
      const dlmmPool = await dlmmInstance
      const position = await dlmmPool.getPosition(new PublicKey(positionAddress))

      const claimFeeTx = await dlmmPool.claimSwapFee({
        owner: walletPubKey,
        position: position
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
      setFormState({ submitting: false })
      toast.error('Claim fee failed')
    }
  }

  return (
    <Button variant="light" size="sm" className="cursor-pointer" onClick={handleClaim} disabled={formState.submitting}>
      Claim Fee
    </Button>
  )
}
