import DLMM from '@yeto/dlmm/ts-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ButtonConnect } from '@/components/button-connect'
import { ChangeEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ExternalLink } from 'lucide-react'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { toast } from 'sonner'
import { getBalance } from '@/lib/pool-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, percentage } from '@/lib/utils'
import { SlippagePopover } from '@/components/slippage-popover'
import { Pair } from '@/components/dlmm/dlmm'

interface DlmmSwapFormProps {
  pair: Pair
}

export function DlmmSwapForm({ pair }: DlmmSwapFormProps) {
  const { publicKey: walletPubKey, connected, sendTransaction } = useWallet()
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const [balances, setBalances] = useState<{ valueX?: number; valueY?: number }>({})
  const [pricePerToken, setPricePerToken] = useState(0)
  const [slippage, setSlippage] = useState(0.1)

  const amountXRef = useRef<HTMLInputElement | null>(null)
  const amountYRef = useRef<HTMLInputElement | null>(null)

  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const connection = useMemo(() => new Connection(endpoint), [endpoint])
  const dlmmInstance = useMemo(() => DLMM.create(connection, new PublicKey(pair.address)), [connection, pair.address])

  useEffect(() => {
    const sync = async () => {
      const dlmmPool = await dlmmInstance
      const activeBin = await dlmmPool.getActiveBin()

      setPricePerToken(parseFloat(dlmmPool.fromPricePerLamport(Number(activeBin.price))))

      if (!walletPubKey) {
        return
      }

      setBalances({
        valueX: await getBalance(connection, walletPubKey, dlmmPool.tokenX.publicKey),
        valueY: await getBalance(connection, walletPubKey, dlmmPool.tokenY.publicKey)
      })
    }
    sync()
  }, [connection, dlmmInstance, walletPubKey])

  const handleSwap = async (v: SyntheticEvent) => {
    v.preventDefault()

    if (!walletPubKey || !connected) {
      return console.error('Wallet not connected')
    }

    try {
      const amountX = parseFloat(amountXRef.current?.value || '')
      if (!amountX) {
        return toast.error('Token x amount is empty')
      }
      setFormState({ submitting: true })

      const dlmmPool = await dlmmInstance
      const swapAmount = new BN(amountX * 10 ** dlmmPool.tokenX.decimal)

      const swapXtoY = true // Quote token as input
      const binArrays = await dlmmPool.getBinArrayForSwap(swapXtoY)

      const slippageBps = new BN(Math.round(slippage * 10_000))
      const swapQuote = dlmmPool.swapQuote(swapAmount, swapXtoY, slippageBps, binArrays)

      // Swap
      const swapTx = await dlmmPool.swap({
        inToken: dlmmPool.tokenX.publicKey,
        binArraysPubkey: swapQuote.binArraysPubkey,
        inAmount: swapAmount,
        lbPair: dlmmPool.pubkey,
        user: walletPubKey,
        minOutAmount: swapQuote.minOutAmount,
        outToken: dlmmPool.tokenY.publicKey
      })

      const signature = await sendTransaction(swapTx, connection)

      setFormState({ submitting: false })

      toast.success('Swap complete', {
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
      let error = 'Failed to swap'
      if (e instanceof Error) {
        error = e.message
      }

      setFormState({ submitting: false, error })
      toast.error('Swap failed', {
        description: error
      })
    }
  }

  const handleChangeX = (v: ChangeEvent<HTMLInputElement>) => {
    const { value } = v.target
    if (amountYRef.current) {
      amountYRef.current.value = value ? String((parseFloat(value) * pricePerToken).toFixed(2)) : ''
    }
  }

  const handleChangeY = (v: ChangeEvent<HTMLInputElement>) => {
    const { value } = v.target
    if (amountXRef.current) {
      amountXRef.current.value = value ? String((parseFloat(value) / pricePerToken).toFixed(2)) : ''
    }
  }

  const increaseBy = (percent: number) => {
    return () => {
      const { valueX, valueY } = balances
      if (valueX && valueX > 0) {
        const newXAmount = percentage(percent, valueX)
        if (!valueY || newXAmount * pricePerToken > valueY) {
          return toast.error('Insufficient TokenY amount')
        } else {
          if (amountXRef.current) {
            amountXRef.current.value = newXAmount.toString()
          }
          if (amountYRef.current) {
            amountYRef.current.value = (newXAmount * pricePerToken).toFixed(2).toString()
          }
        }
      }
    }
  }

  const inputX = (
    <div className="relative flex grow-1">
      <div className="absolute inset-y-2 left-0 ms-3 flex items-center">
        <img src={pair.mint_x.logo_url} alt={pair.mint_x.name} className="h-5 w-5 rounded-full" />
        <span className="ms-2 font-medium">{pair.mint_x.name}</span>
      </div>
      <Input
        ref={amountXRef}
        type="number"
        step=".01"
        placeholder="0"
        className="h-11 ps-16 text-right"
        disabled={formState.submitting}
        onChange={handleChangeX}
        required
      />
    </div>
  )

  const inputY = (
    <div className="relative flex grow-1">
      <div className="absolute inset-y-2 left-0 ms-3 flex items-center">
        <img src={pair.mint_y.logo_url} alt={pair.mint_y.name} className="h-5 w-5 rounded-full" />
        <span className="ms-2 font-medium">{pair.mint_y.name}</span>
      </div>
      <Input
        ref={amountYRef}
        type="number"
        step=".01"
        placeholder="0"
        className="h-11 ps-16 text-right"
        disabled={formState.submitting}
        onChange={handleChangeY}
        required
      />
    </div>
  )

  return (
    <form className="p-6" onSubmit={handleSwap}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Enter Amount</h2>
        <SlippagePopover
          defaultValue={slippage.toString()}
          onChange={value => setSlippage(parseFloat(value))}
          title="Slippage"
        />
      </div>
      <div className="mb-4 space-y-2">
        {inputX}
        <div className="flex items-center justify-between px-1">
          <div className="text-muted-foreground flex text-xs">
            Balance: {balances.valueX === undefined ? <Skeleton className="ms-2 h-4 w-20" /> : balances.valueX}
          </div>
          <div className="flex space-x-1">
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
      <div className="mb-6 space-y-2">
        {inputY}
        <div className="px-1">
          <div className="text-gray flex text-xs">
            Balance: {balances.valueY === undefined ? <Skeleton className="ms-2 h-4 w-20" /> : balances.valueY}
          </div>
        </div>
      </div>
      <hr className="divider" />
      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        {connected ? (
          <Button type="submit" className="text-bright cursor-pointer" disabled={formState.submitting}>
            Swap
          </Button>
        ) : (
          <ButtonConnect />
        )}
        <div className="text-gray space-y-1 text-right text-xs">
          <p>
            1 {pair.mint_x.name} ≈ {formatPrice(pricePerToken, pair.mint_y.decimals)} {pair.mint_y.name}
          </p>
        </div>
      </div>
    </form>
  )
}
