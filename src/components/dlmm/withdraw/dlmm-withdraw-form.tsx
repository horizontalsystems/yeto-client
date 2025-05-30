import { getBinArraysRequiredByPositionRange, getBinFromBinArray, getPriceOfBinByBinId } from '@yeto/dlmm/ts-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ButtonConnect } from '@/components/button-connect'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { Info } from 'lucide-react'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { Pair } from '@/components/dlmm/dlmm'
import { DlmmWithdrawBins } from '@/components/dlmm/withdraw/dlmm-withdraw-bins'
import { BinItem } from '@/components/dlmm/new/dlmm-add-liquidity-bins'
import { DlmmWithdrawSkeleton } from '@/components/dlmm/withdraw/dlmm-withdraw-skeleton'
import { binIdToBinArrayIndex } from '@/lib/pool-utils'
import { linkToSolscan } from '@/lib/ui-utils'
import { InputNumeric } from '@/components/ui/input-numeric'
import { useRouter } from 'next/navigation'
import { useDlmm } from '@/hooks/use-dlmm'

interface DlmmWithdrawFormProps {
  pair: Pair
  poolAddress: string
  positionAddress: string
}

export function DlmmWithdrawForm({ pair, poolAddress, positionAddress }: DlmmWithdrawFormProps) {
  const { publicKey: walletPubKey, connected, sendTransaction } = useWallet()
  const [initializing, setInitializing] = useState(true)
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const [activeBinId, setActiveBinId] = useState<number>(0)
  const [bins, setBins] = useState<BinItem[]>([])

  const [amountPercent, setAmountPercent] = useState(100)
  const [tokenWithdraw, setTokenWithdraw] = useState('mint_x-mint_y')

  const binRangeRef = useRef<number[]>([-34, 34])

  const router = useRouter()
  const { connection, dlmmInstance } = useDlmm(poolAddress)

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

      let fromBinId = binRangeRef.current[0]
      let toBinId = binRangeRef.current[1]
      let closePosition = false

      if (tokenWithdraw === 'mint_x') {
        fromBinId = activeBin.binId
        toBinId = position.positionData.upperBinId
      } else if (tokenWithdraw === 'mint_y') {
        fromBinId = position.positionData.lowerBinId
        toBinId = activeBin.binId
      } else if (tokenWithdraw === 'mint_x-mint_y') {
        closePosition = amountPercent === 100
      }

      let withdrawTx = await dlmmPool.removeLiquidity({
        user: walletPubKey,
        position: new PublicKey(positionAddress),
        binIds: [fromBinId, toBinId],
        bps: new BN(amountPercent * 100),
        shouldClaimAndClose: closePosition
      })

      if (Array.isArray(withdrawTx)) {
        withdrawTx = withdrawTx[0]
      }

      sendTransaction(withdrawTx, connection)
        .then(signature => {
          setFormState({ submitting: false })
          toast.success('Withdraw complete', {
            duration: 5000,
            description: linkToSolscan(signature)
          })
          router.back()
        })
        .catch(e => {
          console.error(e)
          setFormState({ submitting: false, error: e.message })
          toast.error('Withdraw failed', { description: e.message })
        })
    } catch (e) {
      console.log(e)
      let error = 'Failed to withdraw'
      if (e instanceof Error) error = e.message
      setFormState({ submitting: false, error })
      toast.error('Withdraw failed', { description: error })
    }
  }

  const calculateBins = useCallback(async () => {
    const pool = await dlmmInstance
    const activeBin = await pool.getActiveBin()
    const position = await pool.getPosition(new PublicKey(positionAddress))

    const binRange = [position.positionData.lowerBinId, position.positionData.upperBinId]
    binRangeRef.current = binRange
    setActiveBinId(activeBin.binId)

    const minBinId = new BN(binRange[0])
    const maxBinId = new BN(binRange[1])

    const binArraysRequired = getBinArraysRequiredByPositionRange(
      new PublicKey(poolAddress),
      minBinId,
      maxBinId,
      pool.program.programId
    )

    const publicKeys = binArraysRequired.map(i => i.key)
    const binArrays = await pool.program.account.binArray.fetchMultiple(publicKeys)

    const getBin = (binId: number) => {
      const binArrayIdx = binIdToBinArrayIndex(new BN(binId))
      const binArray = binArrays.find(ba => {
        return ba?.index.eq(binArrayIdx)
      })

      return binArray ? getBinFromBinArray(binId, binArray) : null
    }

    const newBins = []

    for (let binId = minBinId.toNumber(); binId <= maxBinId.toNumber(); binId++) {
      const bin = getBin(binId)
      const price = getPriceOfBinByBinId(binId, pool.lbPair.binStep)

      const binItem = {
        liquidity: bin?.liquiditySupply.toString() || '0',
        activeBin: activeBin.binId === binId,
        distributionX: 0,
        distributionY: 0,
        amountX: (bin?.amountX.toNumber() || 0) / 10_000,
        amountY: (bin?.amountY.toNumber() || 0) / 10_000,
        price: pool.fromPricePerLamport(price.toNumber()),
        binId: binId
      }
      newBins.push(binItem)
    }

    setBins(newBins)
  }, [dlmmInstance, positionAddress, poolAddress])

  const increaseBy = (percent: number) => {
    return () => setAmountPercent(percent)
  }

  useEffect(() => {
    setInitializing(true)
    calculateBins().then(() => {
      setInitializing(false)
    })
  }, [poolAddress])

  if (initializing) {
    return <DlmmWithdrawSkeleton />
  }

  return (
    <form className="p-6" onSubmit={handleWithdraw}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Enter amount</h2>
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
                <SelectItem value="mint_x">{pair.mint_x.name}</SelectItem>
                <SelectItem value="mint_y">{pair.mint_y.name}</SelectItem>
                <SelectItem value="mint_x-mint_y">
                  {pair.mint_x.name}-{pair.mint_y.name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-6 space-y-2">
          <div className="relative">
            <InputNumeric
              value={amountPercent}
              className="h-11 pe-7 text-right"
              onChangeValue={v => setAmountPercent(v || 0)}
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

      <DlmmWithdrawBins
        binRangeRef={binRangeRef}
        bins={bins}
        activeBinId={activeBinId}
        disabled={formState.submitting}
        xName={pair.mint_x.name}
        yName={pair.mint_y.name}
      />

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
