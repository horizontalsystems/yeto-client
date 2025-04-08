import DLMM from '@meteora-ag/dlmm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChangeEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ExternalLink, Info } from 'lucide-react'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { toast } from 'sonner'
import { getBalance } from '@/lib/pool-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { percentage } from '@/lib/utils'

interface DlmmSwapFormProps {
  name: string
  address: string
}

export function DlmmSwapForm({ name, address }: DlmmSwapFormProps) {
  const { publicKey: walletPubKey, connected, sendTransaction } = useWallet()
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const [balances, setBalances] = useState<{ valueX?: number; valueY?: number }>({})
  const [pricePerToken, setPricePerToken] = useState(0)
  const [slippage, setSlippage] = useState(0.1)

  const amountXRef = useRef<HTMLInputElement | null>(null)
  const amountYRef = useRef<HTMLInputElement | null>(null)

  const [base, quote] = name.split('-')

  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const connection = useMemo(() => new Connection(endpoint), [endpoint])
  const dlmmInstance = useMemo(
    () => DLMM.create(connection, new PublicKey(address), { cluster: 'devnet' }),
    [connection, address]
  )

  useEffect(() => {
    const sync = async () => {
      const dlmmPool = await dlmmInstance
      const activeBin = await dlmmPool.getActiveBin()

      setPricePerToken(parseFloat(activeBin.pricePerToken))

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
      const amountX = parseFloat(amountYRef.current?.value || '')
      if (!amountX) {
        return toast.error('Token x amount is empty')
      }
      setFormState({ submitting: true })

      const dlmmPool = await dlmmInstance
      const swapAmount = new BN(amountX * 10 ** dlmmPool.tokenX.decimal)

      const swapYtoX = true // Quote token as input
      const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX)

      const swapQuote = dlmmPool.swapQuote(swapAmount, swapYtoX, new BN(percentage(amountX, slippage)), binArrays)

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

  const valueToAmount = (value?: string) => {
    return value ? String((parseFloat(value) / pricePerToken).toFixed(2)) : ''
  }

  const handleChangeX = (v: ChangeEvent<HTMLInputElement>) => {
    const { value } = v.target
    if (amountYRef.current) {
      amountYRef.current.value = valueToAmount(value)
    }
  }

  const handleChangeY = (v: ChangeEvent<HTMLInputElement>) => {
    const { value } = v.target
    if (amountXRef.current) {
      amountXRef.current.value = valueToAmount(value)
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
        <Info size="16" />
        <span className="ms-2 font-medium">{base}</span>
      </div>
      <Input
        ref={amountXRef}
        type="number"
        step=".01"
        placeholder="0"
        className="h-11 ps-10 text-right"
        disabled={formState.submitting}
        onChange={handleChangeX}
        required
      />
    </div>
  )

  const inputY = (
    <div className="relative flex grow-1">
      <div className="absolute inset-y-2 left-0 ms-3 flex items-center">
        <Info size="16" />
        <span className="ms-2 font-medium">{quote}</span>
      </div>
      <Input
        ref={amountYRef}
        type="number"
        step=".01"
        placeholder="0"
        className="h-11 ps-10 text-right"
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
        <Select
          value={slippage.toString()}
          disabled={formState.submitting}
          onValueChange={v => setSlippage(parseFloat(v))}
        >
          <SelectTrigger className="h-8 w-[80px] text-xs">
            <SelectValue placeholder="Slippage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.1">0.1%</SelectItem>
            <SelectItem value="0.5">0.5%</SelectItem>
            <SelectItem value="1">1%</SelectItem>
            <SelectItem value="2">2%</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4 space-y-2">
        {inputX}
        <div className="flex items-center justify-between px-1">
          <div className="text-muted-foreground flex text-xs">
            Balance: {balances.valueX === null ? <Skeleton className="ms-2 h-5 w-20" /> : balances.valueX}
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
          <div className="text-muted-foreground flex text-xs">
            Balance: {balances.valueY === null ? <Skeleton className="h-5 w-20" /> : balances.valueY}
          </div>
        </div>
      </div>
      <hr className="divider" />
      <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Button type="submit" className="text-bright cursor-pointer" disabled={formState.submitting}>
          Swap
        </Button>
        <div className="text-muted-foreground space-y-1 text-right text-xs">
          <p>
            1 {base} ≈ {pricePerToken} {quote}
          </p>
        </div>
      </div>
    </form>
  )
}
