import DLMM from '@yeto/dlmm/ts-client'
import { Button } from '@/components/ui/button'
import { ButtonConnect } from '@/components/button-connect'
import { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { ArrowDownUp } from 'lucide-react'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { toast } from 'sonner'
import { getBalance } from '@/lib/pool-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, percentage } from '@/lib/utils'
import { SlippagePopover } from '@/components/slippage-popover'
import { Pair } from '@/components/dlmm/dlmm'
import { linkToSolscan } from '@/lib/ui-utils'
import { InputNumeric } from '@/components/ui/input-numeric'

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
  const [isTokenYisMain, setIsTokenYisMain] = useState(false)

  const [amountX, setAmountX] = useState(0)
  const [amountY, setAmountY] = useState(0)

  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const connection = useMemo(() => new Connection(endpoint), [endpoint])
  const dlmmInstance = useMemo(() => DLMM.create(connection, new PublicKey(pair.address)), [connection, pair.address])

  useEffect(() => {
    const syncBalances = async () => {
      const dlmmPool = await dlmmInstance
      const activeBin = await dlmmPool.getActiveBin()
      setPricePerToken(parseFloat(dlmmPool.fromPricePerLamport(Number(activeBin.price))))

      if (!walletPubKey) return

      setBalances({
        valueX: await getBalance(connection, walletPubKey, dlmmPool.tokenX.publicKey),
        valueY: await getBalance(connection, walletPubKey, dlmmPool.tokenY.publicKey)
      })
    }
    syncBalances()
  }, [connection, dlmmInstance, walletPubKey])

  const handleSwap = async (v: SyntheticEvent) => {
    v.preventDefault()

    if (!walletPubKey || !connected) {
      return console.error('Wallet not connected')
    }

    if (!amountX || !amountY) {
      return toast.error('Please enter valid amounts')
    }

    try {
      setFormState({ submitting: true })

      const dlmmPool = await dlmmInstance
      const swapAmount = new BN(
        isTokenYisMain ? amountY * 10 ** dlmmPool.tokenY.decimal : amountX * 10 ** dlmmPool.tokenX.decimal
      )

      const swapXtoY = !isTokenYisMain
      const binArrays = await dlmmPool.getBinArrayForSwap(swapXtoY)

      const slippageBps = new BN(Math.round(slippage * 100))
      const swapQuote = dlmmPool.swapQuote(swapAmount, swapXtoY, slippageBps, binArrays)

      const inToken = isTokenYisMain ? dlmmPool.tokenY.publicKey : dlmmPool.tokenX.publicKey
      const outToken = isTokenYisMain ? dlmmPool.tokenX.publicKey : dlmmPool.tokenY.publicKey

      const swapTx = await dlmmPool.swap({
        inToken,
        binArraysPubkey: swapQuote.binArraysPubkey,
        inAmount: swapAmount,
        lbPair: dlmmPool.pubkey,
        user: walletPubKey,
        minOutAmount: swapQuote.minOutAmount,
        outToken
      })

      sendTransaction(swapTx, connection)
        .then(signature => {
          setFormState({ submitting: false })
          toast.success('Swap complete', {
            duration: 5000,
            description: linkToSolscan(signature)
          })
        })
        .catch(e => {
          console.error(e)
          setFormState({ submitting: false, error: e.message })
          toast.error('Swap failed', { description: e.message })
        })
    } catch (e) {
      console.log(e)
      setFormState({ submitting: false })
      toast.error('Swap failed')
    }
  }

  const handleChangeX = (value: number | undefined) => {
    setAmountX(value || 0)
    if (value) {
      setAmountY(value * pricePerToken)
    } else {
      setAmountY(0)
    }
  }

  const handleChangeY = (value: number | undefined) => {
    setAmountY(value || 0)
    if (value) {
      setAmountX(value / pricePerToken)
    } else {
      setAmountX(0)
    }
  }

  const increaseBy = (percent: number) => {
    return () => {
      const { valueX, valueY } = balances
      if (!isTokenYisMain && valueX && valueX > 0) {
        const newX = percentage(percent, valueX)
        setAmountX(newX)
        setAmountY(newX * pricePerToken)
      }
      if (isTokenYisMain && valueY && valueY > 0) {
        const newY = percentage(percent, valueY)
        setAmountY(newY)
        setAmountX(newY / pricePerToken)
      }
    }
  }

  const inputX = (
    <div className="relative flex grow-1">
      <div className="absolute inset-y-2 left-0 ms-3 flex items-center">
        <img src={pair.mint_x.logo_url} alt={pair.mint_x.name} className="h-5 w-5 rounded-full" />
        <span className="ms-2 font-medium">{pair.mint_x.name}</span>
      </div>
      <InputNumeric
        className="h-11 ps-16 text-right"
        disabled={formState.submitting}
        onChangeValue={handleChangeX}
        value={amountX}
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
      <InputNumeric
        className="h-11 ps-16 text-right"
        disabled={formState.submitting}
        onChangeValue={handleChangeY}
        value={amountY}
        required
      />
    </div>
  )

  const balanceY = (
    <div className="text-gray flex text-xs">
      Balance: {balances.valueY === undefined ? <Skeleton className="ms-2 h-4 w-20" /> : balances.valueY}
    </div>
  )

  const balanceX = (
    <div className="text-gray flex text-xs">
      Balance: {balances.valueX === undefined ? <Skeleton className="ms-2 h-4 w-20" /> : balances.valueX}
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
        {isTokenYisMain ? inputY : inputX}
        <div className="flex items-center justify-between px-1">
          {isTokenYisMain ? balanceY : balanceX}
          <div className="flex space-x-1">
            <ToggleGroup type="single" className="flex space-x-2" disabled={formState.submitting}>
              {[25, 50, 75, 100].map(p => (
                <Button
                  key={p}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="bg-bran h-6 cursor-pointer px-2 text-xs"
                  onClick={increaseBy(p)}
                >
                  {p}%
                </Button>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </div>
      <div className="mb-5 flex justify-center">
        <ArrowDownUp className="cursor-pointer" onClick={() => setIsTokenYisMain(!isTokenYisMain)} />
      </div>
      <div className="mb-6 space-y-2">
        {isTokenYisMain ? inputX : inputY}
        <div className="px-1">{isTokenYisMain ? balanceX : balanceY}</div>
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
