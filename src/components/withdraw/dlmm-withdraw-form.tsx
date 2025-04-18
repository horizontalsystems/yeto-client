import DLMM from '@meteora-ag/dlmm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ButtonConnect } from '@/components/button-connect'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ExternalLink, Info } from 'lucide-react'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { toast } from 'sonner'

interface DlmmWithdrawFormProps {
  name: string
  poolAddress: string
  positionAddress: string
}

export function DlmmWithdrawForm({ name, poolAddress, positionAddress }: DlmmWithdrawFormProps) {
  const { publicKey: walletPubKey, connected, sendTransaction } = useWallet()
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const [binRange, setBinRange] = useState([-34, 34])
  const [slippage, setSlippage] = useState(1)

  const [amountPercent, setAmountPercent] = useState(100)

  const [mintX, mintY] = name.split('-')
  const [tokenWithdraw, setTokenWithdraw] = useState('mint_x')

  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const connection = useMemo(() => new Connection(endpoint), [endpoint])
  const dlmmInstance = useMemo(
    () => DLMM.create(connection, new PublicKey(poolAddress), { cluster: 'devnet' }),
    [connection, poolAddress]
  )

  useEffect(() => {
    const sync = async () => {
      const dlmmPool = await dlmmInstance
      const position = await dlmmPool.getPosition(new PublicKey(positionAddress))
      setBinRange([position.positionData.lowerBinId, position.positionData.upperBinId])
    }
    sync()
  }, [connection, dlmmInstance, positionAddress])

  const handleWithdraw = async (v: SyntheticEvent) => {
    v.preventDefault()

    if (!walletPubKey || !connected) {
      return console.error('Wallet not connected')
    }

    try {
      setFormState({ submitting: true })

      const dlmmPool = await dlmmInstance
      const position = await dlmmPool.getPosition(new PublicKey(positionAddress))
      const activeBin = await dlmmPool.getActiveBin()

      let fromBinId = binRange[0]
      let toBinId = binRange[1]

      if (tokenWithdraw === 'mint_x') {
        fromBinId = activeBin.binId
        toBinId = position.positionData.upperBinId
      } else if (tokenWithdraw === 'mint_y') {
        fromBinId = position.positionData.lowerBinId
        toBinId = activeBin.binId
      }

      let withdrawTx = await dlmmPool.removeLiquidity({
        user: walletPubKey,
        position: new PublicKey(positionAddress),
        fromBinId: fromBinId,
        toBinId: toBinId,
        bps: new BN(amountPercent * 100),
        shouldClaimAndClose: true
      })

      if (Array.isArray(withdrawTx)) {
        withdrawTx = withdrawTx[0]
      }

      const signature = await sendTransaction(withdrawTx, connection)

      setFormState({ submitting: false })

      toast.success('Withdraw complete', {
        duration: 5000,
        description: (
          <div className="flex flex-row items-center">
            <span>Solscan :</span>
            <a className="text-blue-400" target="_blank" href={`https://solscan.io/tx/${signature}`}>
              <ExternalLink size="18" />
            </a>
          </div>
        )
      })
    } catch (e) {
      let error = 'Failed to withdraw'
      if (e instanceof Error) {
        error = e.message
      }

      setFormState({ submitting: false, error })
      toast.error('Withdraw failed', { description: error })
    }
  }

  const increaseBy = (percent: number) => {
    return () => setAmountPercent(percent)
  }

  return (
    <form className="p-6" onSubmit={handleWithdraw}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-2xl">Percentage to withdraw</div>
        <div>
          <Select
            value={slippage.toString()}
            onValueChange={v => setSlippage(parseFloat(v))}
            disabled={formState.submitting}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-0">
              <SelectItem value="1">1%</SelectItem>
              <SelectItem value="2">2%</SelectItem>
              <SelectItem value="3">3%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="mb-4 space-y-2">
          <div className="relative flex grow-1">
            <Select value={tokenWithdraw} onValueChange={setTokenWithdraw}>
              <SelectTrigger className="h-11 w-full">
                <div className="flex items-center justify-start space-x-2">
                  <Info size="16" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="min-w-0">
                <SelectItem value="mint_x">{mintX}</SelectItem>
                <SelectItem value="mint_y">{mintY}</SelectItem>
                <SelectItem value="mint_x-mint_y">{name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-6 space-y-2">
          <div className="relative">
            <Input
              type="number"
              step=".01"
              placeholder="0"
              value={amountPercent}
              className="h-11 pe-7 text-right"
              onChange={v => setAmountPercent(parseFloat(v.target.value) || 0)}
              disabled={formState.submitting}
              required
            />
            <div className="absolute inset-y-3 right-3 flex items-center">
              <span className="ms-2">%</span>
            </div>
          </div>
          <div className="flex justify-end px-1">
            <ToggleGroup type="single" className="flex space-x-2" disabled={formState.submitting}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-bran h-6 cursor-pointer px-2 text-xs"
                onClick={increaseBy(25)}
              >
                25%
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-bran h-6 cursor-pointer px-2 text-xs"
                onClick={increaseBy(50)}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-bran h-6 cursor-pointer px-2 text-xs"
                onClick={increaseBy(75)}
              >
                75%
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-bran h-6 cursor-pointer px-2 text-xs"
                onClick={increaseBy(100)}
              >
                Max
              </Button>
            </ToggleGroup>
          </div>
        </div>
      </div>

      <hr className="divider" />
      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        {connected ? (
          <Button type="submit" className="text-bright cursor-pointer" disabled={formState.submitting}>
            Withdraw
          </Button>
        ) : (
          <ButtonConnect />
        )}
      </div>
    </form>
  )
}
