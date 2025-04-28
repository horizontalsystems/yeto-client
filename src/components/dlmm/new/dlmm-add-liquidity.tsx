'use client'

import DLMM, {
  getBinArraysRequiredByPositionRange,
  getBinFromBinArray,
  getPriceOfBinByBinId,
  StrategyType
} from '@yeto/dlmm/ts-client'
import { toast } from 'sonner'
import { omit } from 'es-toolkit/compat'
import { useDebouncedCallback } from 'use-debounce'
import { BN } from '@coral-xyz/anchor'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createBalancePosition, getBalance } from '@/lib/pool-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { DlmmAddLiquiditySkeleton } from '@/components/dlmm/new/dlmm-add-liquidity-skeleton'
import { Switch } from '@/components/ui/switch'
import { ButtonConnect } from '@/components/button-connect'
import { BinItem, DlmmLiquidityChart } from '@/components/dlmm/new/dlmm-liquidity-chart'
import { binIdToBinArrayIndex, cn, formatPrice, percentage, percentageChange, toRounded } from '@/lib/utils'
import { Pair } from '@/components/dlmm/dlmm'
import { SlippagePopover } from '@/components/slippage-popover'

export interface AddLiquidityProps {
  pair: Pair
}

type MinMaxPrices = {
  minPrice: number
  minPriceChange: number
  maxPrice: number
  maxPriceChange: number
}

export function DlmmAddLiquidity({ pair }: AddLiquidityProps) {
  const { publicKey: walletPubKey, connected, sendTransaction } = useWallet()

  const [binRange] = useState([-34, 34])
  const [bins, setBins] = useState<BinItem[]>([])
  const [activeBinId, setActiveBinId] = useState<number>(0)
  const [initializing, setInitializing] = useState(true)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const strategies = ['Spot', 'Bid-Ask']
  const [strategy, setStrategy] = useState<string>(strategies[0])
  const [autoFill, setAutoFill] = useState(false)

  const autoFillRef = useRef<number>(1)
  const binRangeRef = useRef<number[]>(binRange)
  const binShiftRef = useRef<number>(0)

  const [balances, setBalances] = useState<{ valueX?: number; valueY?: number }>({})
  const baseAmountRef = useRef<HTMLInputElement>(null)
  const quoteAmountRef = useRef<HTMLInputElement>(null)
  const [priceRange, setPriceRange] = useState<MinMaxPrices>({
    minPrice: 0,
    minPriceChange: 0,
    maxPrice: 0,
    maxPriceChange: 0
  })

  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const connection = useMemo(() => new Connection(endpoint), [endpoint])
  const dlmmInstance = useMemo(() => DLMM.create(connection, new PublicKey(pair.address)), [connection, pair.address])

  const [slippage, setSlippage] = useState('0.5')

  const handleSubmit = async (v: SyntheticEvent) => {
    v.preventDefault()

    if (!walletPubKey || !connected) {
      return console.error('Wallet not connected')
    }

    const amountX = parseFloat(baseAmountRef.current?.value || '')
    if (!amountX || amountX <= 0) {
      return setErrors({ ...errors, amountX: 'Amount X is required' })
    }

    const amountY = parseFloat(quoteAmountRef.current?.value || '')
    if (!amountY || amountY <= 0) {
      return setErrors({ ...errors, amountY: 'Amount Y is required' })
    }

    try {
      setFormState({ submitting: true })

      const dlmmPool = await dlmmInstance

      const { createPositionTx, newBalancePosition } = await createBalancePosition(
        dlmmPool,
        amountX,
        amountY,
        new BN(activeBinId + binRangeRef.current[0] - binShiftRef.current),
        new BN(activeBinId + binRangeRef.current[1] - binShiftRef.current),
        walletPubKey,
        connection,
        strategy === 'Spot' ? StrategyType.SpotBalanced : StrategyType.BidAskBalanced
      )

      const signature = await sendTransaction(createPositionTx, connection, {
        signers: [newBalancePosition]
      })

      setFormState({ submitting: false })

      toast.success('Liquidity added', {
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
      let error = 'Failed to add liquidity'
      if (e instanceof Error) {
        error = e.message
      }

      setFormState({ submitting: false, error })

      toast.error('Failed to add liquidity', {
        description: error
      })
    }
  }

  const syncBins = useCallback(async () => {
    const pool = await dlmmInstance
    const activeBin = await pool.getActiveBin()
    setActiveBinId(activeBin.binId)
  }, [dlmmInstance])

  const calculatePriceRange = useCallback(async (minBin: number, maxBin: number, binPrice: string, binStep: number) => {
    const startPrice = getPriceOfBinByBinId(minBin, binStep)
    const startPriceChange = percentageChange(binPrice, startPrice.toNumber())
    const endPrice = getPriceOfBinByBinId(maxBin, binStep)
    const endPriceChange = percentageChange(binPrice, endPrice.toNumber())
    const pool = await dlmmInstance

    setPriceRange({
      minPrice: Number(pool.fromPricePerLamport(startPrice.toNumber())),
      minPriceChange: toRounded(startPriceChange || 0),
      maxPrice: Number(pool.fromPricePerLamport(endPrice.toNumber())),
      maxPriceChange: toRounded(endPriceChange || 0)
    })
  }, [dlmmInstance])

  const syncBalance = useCallback(async () => {
    const dlmmPool = await dlmmInstance
    if (!walletPubKey) {
      return
    }

    setBalances({
      valueX: await getBalance(connection, walletPubKey, dlmmPool.tokenX.publicKey),
      valueY: await getBalance(connection, walletPubKey, dlmmPool.tokenY.publicKey)
    })
  }, [connection, dlmmInstance, walletPubKey])

  const calculateBins = useCallback(async () => {
    const pool = await dlmmInstance
    const activeBin = await pool.getActiveBin()

    const minBinId = new BN(activeBin.binId + binRange[0] - binShiftRef.current)
    const maxBinId = new BN(activeBin.binId + binRange[1] - binShiftRef.current)

    const binArraysRequired = getBinArraysRequiredByPositionRange(
      new PublicKey(pair.address),
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
    for (let i = minBinId.toNumber(); i <= maxBinId.toNumber(); i++) {
      const bin = getBin(i)
      const binItem = {
        liquidity: bin ? bin.liquiditySupply.toString() : '0',
        amountX: bin ? bin.amountX.toString() : '0',
        amountY: bin ? bin.amountY.toString() : '0',
        activeBin: activeBin.binId === i,
        binId: i
      }
      newBins.push(binItem)
    }

    setBins(newBins)
    calculatePriceRange(minBinId.toNumber(), maxBinId.toNumber(), activeBin.price, pool.lbPair.binStep)
  }, [pair.address, binRange, calculatePriceRange, dlmmInstance])

  const calculateBinsThrottle = useDebouncedCallback(calculateBins, 200)

  useEffect(() => {
    setInitializing(true)
    syncBins()
      .then(calculateBins)
      .then(syncBalance)
      .finally(() => {
        setInitializing(false)
      })
  }, [pair.address, calculateBins, syncBalance, syncBins])

  const onChangeBaseAmount = async (amount: string) => {
    setErrors({ ...omit(errors, ['amountX']) })

    const value = parseFloat(amount) || 0
    const pool = await dlmmInstance
    const activeBin = await pool.getActiveBin()
    if (quoteAmountRef.current) {
      quoteAmountRef.current.value = toRounded(
        parseFloat(pool.fromPricePerLamport(Number(activeBin.price))) * value
      ).toString()
    }
  }

  const onMaxBaseAmount = () => {
    if (balances.valueX !== undefined && baseAmountRef.current) {
      baseAmountRef.current.value = balances.valueX.toString()
      onChangeBaseAmount(baseAmountRef.current.value)
    }
  }

  const onChangeQuoteAmount = async (amount: string) => {
    setErrors({ ...omit(errors, ['amountY']) })

    const value = parseFloat(amount) || 0
    const pool = await dlmmInstance
    const activeBin = await pool.getActiveBin()
    if (baseAmountRef.current) {
      baseAmountRef.current.value = toRounded(
        value / parseFloat(pool.fromPricePerLamport(Number(activeBin.price)))
      ).toString()
    }
  }

  const onMaxQuoteAmount = () => {
    if (balances.valueY !== undefined && quoteAmountRef.current) {
      quoteAmountRef.current.value = balances.valueY.toString()
      onChangeQuoteAmount(quoteAmountRef.current.value)
    }
  }

  const onChangeAutoFill = (checked: boolean) => {
    setAutoFill(checked)
    if (balances.valueX === undefined || balances.valueY === undefined || !baseAmountRef.current) {
      return
    }

    if (checked) {
      const newAmount = toRounded(percentage(autoFillRef.current, balances.valueX)).toString()
      baseAmountRef.current.value = newAmount
      onChangeBaseAmount(newAmount)
    }
  }

  if (initializing) {
    return <DlmmAddLiquiditySkeleton />
  }

  return (
    <form className="p-6" onSubmit={handleSubmit}>
      <div className="mb-3">
        <div className="flex justify-between">
          <div className="text-2xl">Enter amount</div>
          <div className="flex gap-2">
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm text-nowrap">Auto Fill</span>
              <Switch className="ms-1" onCheckedChange={onChangeAutoFill} checked={autoFill} />
            </div>
            <SlippagePopover defaultValue={slippage} onChange={setSlippage} />
          </div>
        </div>
        <div className="text-muted-foreground mt-1 text-sm">
          Specify the token amounts you&#39;d like to contribute to the liquidity pool.
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="flex grow-1 flex-col">
          <div className="relative">
            <div className="absolute top-3 left-0 ms-3 flex items-center">
              <img src={pair.mint_x.logo_url} alt="" width="24" height="24" />
              <span className="ms-2">{pair.mint_x.name}</span>
            </div>
            <Input
              ref={baseAmountRef}
              type="text"
              placeholder="0"
              className={cn('h-11 ps-10 text-right', { 'border-red-400': !!errors.amountX })}
              onChange={v => onChangeBaseAmount(v.target.value)}
              disabled={formState.submitting}
            />
            <div className="mt-1 flex justify-between">
              <div className="text-gray flex items-center text-sm">
                <span className="me-1">Balance</span>
                {balances.valueX === undefined ? <Skeleton className="ms-1 mt-1 h-4 w-20" /> : balances.valueX}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-bran h-6 cursor-pointer px-2 text-xs"
                onClick={onMaxBaseAmount}
              >
                Max
              </Button>
            </div>
          </div>
          {errors.amountX && <span className="mt-1 text-sm text-red-400">{errors.amountX}</span>}
        </div>

        <div className="flex grow-1 flex-col">
          <div className="relative">
            <div className="absolute top-3 left-0 ms-3 flex items-center">
              <img src={pair.mint_y.logo_url} alt="" width="24" height="24" />
              <span className="ms-2">{pair.mint_y.name}</span>
            </div>
            <Input
              ref={quoteAmountRef}
              type="text"
              placeholder="0"
              className={cn('h-11 ps-10 text-right', { 'border-red-400': !!errors.amountY })}
              onChange={v => onChangeQuoteAmount(v.target.value)}
              disabled={formState.submitting}
            />
            <div className="mt-1 flex justify-between">
              <div className="text-gray flex items-center text-sm">
                <span className="me-1">Balance</span>
                {balances.valueY === undefined ? <Skeleton className="ms-1 mt-1 h-4 w-20" /> : balances.valueY}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="bg-bran h-6 cursor-pointer px-2 text-xs"
                onClick={onMaxQuoteAmount}
              >
                Max
              </Button>
            </div>
          </div>
          {errors.amountY && <span className="mt-1 text-sm text-red-400">{errors.amountY}</span>}
        </div>
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="">Set Price Range</div>
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" type="button">
              Reset
            </Button>
            <Select defaultValue={strategy} onValueChange={setStrategy} disabled={formState.submitting}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-0">
                <SelectGroup>
                  {strategies.map((item, i) => (
                    <SelectItem key={i} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <ToggleGroup type="single" variant="outline" size="sm" defaultValue="sol" disabled={formState.submitting}>
              <ToggleGroupItem value="sol" className="px-3">
                {pair.mint_x.name}
              </ToggleGroupItem>
              <ToggleGroupItem value="usdc" className="px-3" disabled>
                {pair.mint_y.name}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        <DlmmLiquidityChart
          binRange={binRange}
          binRangeRef={binRangeRef}
          binShiftRef={binShiftRef}
          bins={bins}
          strategy={strategy}
          activeBinId={activeBinId}
          calculateBinsThrottle={calculateBinsThrottle}
          disabled={formState.submitting}
        />
      </div>
      <div className="mb-6 flex gap-2">
        <div className="w-full md:w-8/12">
          <Label className="mb-2">Min Price</Label>
          <div className="flex">
            <Input
              value={formatPrice(priceRange.minPrice, pair.mint_x.decimals)}
              className="h-11 grow-1 rounded-r-none border-r-0"
              type="text"
              onChange={v => console.log(v)}
              disabled={formState.submitting}
            />
            <div className="relative">
              <Input
                value={priceRange.minPriceChange}
                className="h-11 w-20 rounded-s-none pe-7 text-right"
                onChange={v => console.log(v)}
                disabled={formState.submitting}
              />
              <div className="absolute inset-y-3 right-3 flex items-center">
                <span className="ms-2">%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-8/12">
          <Label className="mb-2">Max Price</Label>
          <div className="flex">
            <Input
              value={formatPrice(priceRange.maxPrice, pair.mint_x.decimals)}
              className="h-11 grow-1 rounded-r-none border-r-0"
              type="text"
              placeholder="0"
              onChange={v => console.log(v)}
              disabled={formState.submitting}
            />
            <div className="relative">
              <Input
                value={priceRange.maxPriceChange}
                className="h-11 w-20 rounded-s-none pe-7 text-right"
                placeholder="0"
                onChange={v => console.log(v)}
                disabled={formState.submitting}
              />
              <div className="absolute inset-y-3 right-3 flex items-center">
                <span className="ms-2">%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-4/12 md:w-1/12">
          <Label className="mb-2">Bins</Label>
          <Input
            type="text"
            placeholder="69"
            className="h-11"
            value={Math.abs(binRangeRef.current[0]) + 1 + binRangeRef.current[1]}
            disabled
          />
        </div>
      </div>
      {connected ? (
        <Button variant="light" type="submit" className="cursor-pointer" disabled={formState.submitting}>
          Add Liquidity
        </Button>
      ) : (
        <ButtonConnect />
      )}
    </form>
  )
}
