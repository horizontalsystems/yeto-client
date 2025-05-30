'use client'

import {
  calculateBidAskDistribution,
  calculateSpotDistribution,
  getBinArraysRequiredByPositionRange,
  getBinFromBinArray,
  getPriceOfBinByBinId,
  StrategyType
} from '@yeto/dlmm/ts-client'
import Decimal from 'decimal.js'
import { toast } from 'sonner'
import { omit } from 'es-toolkit/compat'
import { useDebouncedCallback } from 'use-debounce'
import { BN } from '@coral-xyz/anchor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputNumeric } from '@/components/ui/input-numeric'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PublicKey } from '@solana/web3.js'
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { binIdToBinArrayIndex, createBalancePosition } from '@/lib/pool-utils'
import { Skeleton } from '@/components/ui/skeleton'
import { DlmmAddLiquiditySkeleton } from '@/components/dlmm/new/dlmm-add-liquidity-skeleton'
import { Switch } from '@/components/ui/switch'
import { ButtonConnect } from '@/components/button-connect'
import { BinItem, DlmmAddLiquidityBins } from '@/components/dlmm/new/dlmm-add-liquidity-bins'
import { cn, formatPrice, percentageChange, toRounded } from '@/lib/utils'
import { Pair } from '@/components/dlmm/dlmm'
import { SlippagePopover } from '@/components/slippage-popover'
import { linkToSolscan } from '@/lib/ui-utils'
import { useDlmm } from '@/hooks/use-dlmm'
import { useTokensBalances } from '@/hooks/use-tokens-balances'
import { useActiveBin } from '@/hooks/use-active-bin'

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
  const [initializing, setInitializing] = useState(true)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const strategies = ['Spot', 'Bid-Ask']
  const [strategy, setStrategy] = useState<string>(strategies[0])

  const autoFillRef = useRef(false)
  const binRangeRef = useRef<number[]>(binRange)
  const binShiftRef = useRef<number>(0)

  const [amounts, setAmounts] = useState<{ amountX?: number; amountY?: number }>({})

  const [priceRange, setPriceRange] = useState<MinMaxPrices>({
    minPrice: 0,
    minPriceChange: 0,
    maxPrice: 0,
    maxPriceChange: 0
  })

  const { connection, dlmmInstance } = useDlmm(pair.address)
  const { activeBinId, activeBinPrice, syncActiveBin } = useActiveBin(dlmmInstance)
  const { balances, loading: loadingBalance } = useTokensBalances(connection, dlmmInstance, walletPubKey, 30000)

  const [slippage, setSlippage] = useState(0.5)

  const handleSubmit = async (v: SyntheticEvent) => {
    v.preventDefault()

    if (!walletPubKey || !connected) {
      return console.error('Wallet not connected')
    }

    const amountX = amounts.amountX || 0
    const amountY = amounts.amountY || 0
    if (amountX < 0 && amountY < 0) {
      return setErrors({ ...errors, amountX: 'Either AmountX or AmountY is required' })
    }

    try {
      setFormState({ submitting: true })

      const dlmmPool = await dlmmInstance
      const activeBin = await dlmmPool.getActiveBin()
      const isSingleSided = (amountX > 0 && amountY <= 0) || (amountY > 0 && amountX <= 0)

      let minBinId = activeBin.binId + binRangeRef.current[0] - binShiftRef.current
      let maxBinId = activeBin.binId + binRangeRef.current[1] - binShiftRef.current

      if (isSingleSided) {
        if (minBinId === activeBin.binId) {
          minBinId += 1
        }
        if (maxBinId === activeBin.binId) {
          maxBinId -= 1
        }
      }

      const { createPositionTx, newBalancePosition } = await createBalancePosition(
        dlmmPool,
        amountX,
        amountY,
        new BN(minBinId),
        new BN(maxBinId),
        walletPubKey,
        Math.round(slippage * 100),
        connection,
        strategy === 'Spot' ? StrategyType.SpotImBalanced : StrategyType.BidAskImBalanced
      )

      sendTransaction(createPositionTx, connection, { signers: [newBalancePosition] })
        .then(signature => {
          setFormState({ submitting: false })
          toast.success('Liquidity added', {
            duration: 5000,
            description: linkToSolscan(signature)
          })
        })
        .catch(e => {
          console.error(e)
          setFormState({ submitting: false, error: e.message })
          toast.error('Failed to add liquidity', {
            description: e.message
          })
        })
    } catch (e) {
      console.log(e)
      let error = 'Failed to add liquidity'
      if (e instanceof Error) error = e.message
      setFormState({ submitting: false, error })
      toast.error('Failed to add liquidity', { description: error })
    }
  }

  const calculatePriceRange = useCallback(
    async (minBin: number, maxBin: number, binPrice: string, binStep: number) => {
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
    },
    [dlmmInstance]
  )

  const calculateBins = useCallback(async () => {
    const pool = await dlmmInstance

    const minBinId = new BN(activeBinId + binRange[0] - binShiftRef.current)
    const maxBinId = new BN(activeBinId + binRange[1] - binShiftRef.current)

    const binArraysRequired = getBinArraysRequiredByPositionRange(
      new PublicKey(pair.address),
      minBinId,
      maxBinId,
      pool.program.programId
    )

    const binArrays = await pool.program.account.binArray.fetchMultiple(binArraysRequired.map(i => i.key))

    const getBin = (binId: number) => {
      const binArrayIdx = binIdToBinArrayIndex(new BN(binId))
      const binArray = binArrays.find(ba => {
        return ba?.index.eq(binArrayIdx)
      })

      return binArray ? getBinFromBinArray(binId, binArray) : null
    }

    const amountX = amounts.amountX || 0
    const amountY = amounts.amountY || 0
    const isSingleSided = (amountX > 0 && amountY <= 0) || (amountY > 0 && amountX <= 0)
    const range = Array.from(
      { length: Math.abs(maxBinId.toNumber() - minBinId.toNumber() + 1) },
      (_, i) => minBinId.toNumber() + i
    ).filter(item => {
      return isSingleSided ? activeBinId !== item : true
    })

    const smallest = Math.min(...range)
    const mixedRange = minBinId < 0 && maxBinId > 0

    let distributionRange = range
    let distributionBinId = activeBinId
    if (mixedRange) {
      distributionRange = range.map(item => item + Math.abs(smallest))
      distributionBinId = distributionBinId + Math.abs(smallest)
    }

    const distributionMap: { [key: number]: { xAmount: number; yAmount: number } } = {}
    let distributions =
      strategy === 'Spot'
        ? calculateSpotDistribution(distributionBinId, distributionRange)
        : calculateBidAskDistribution(distributionBinId, distributionRange)

    if (mixedRange) {
      distributions = distributions.map(item => {
        return {
          ...item,
          binId: item.binId - Math.abs(smallest)
        }
      })
    }

    for (let i = 0; i < distributions.length; i++) {
      const distribution = distributions[i]
      distributionMap[distribution.binId] = {
        xAmount: distribution.xAmountBpsOfTotal.toNumber(),
        yAmount: distribution.yAmountBpsOfTotal.toNumber()
      }
    }

    const newBins = []
    for (let binId = minBinId.toNumber(); binId <= maxBinId.toNumber(); binId++) {
      if (isSingleSided && activeBinId === binId) {
        continue
      }

      const bin = getBin(binId)
      const distribution = distributionMap[binId]
      const price = getPriceOfBinByBinId(binId, pool.lbPair.binStep)

      newBins.push({
        liquidity: bin?.liquiditySupply.toString() || '0',
        activeBin: activeBinId === binId,
        distributionX: (amountX * distribution.xAmount) / 10_000,
        distributionY: (amountY * distribution.yAmount) / 10_000,
        amountX: (bin?.amountX.toNumber() || 0) / 10_000,
        amountY: (bin?.amountY.toNumber() || 0) / 10_000,
        price: pool.fromPricePerLamport(price.toNumber()),
        binId: binId
      })
    }

    setBins(newBins)
    calculatePriceRange(minBinId.toNumber(), maxBinId.toNumber(), activeBinPrice, pool.lbPair.binStep)
  }, [
    dlmmInstance,
    activeBinId,
    binRange,
    pair.address,
    amounts.amountX,
    amounts.amountY,
    strategy,
    calculatePriceRange,
    activeBinPrice
  ])

  const calculateBinsThrottle = useDebouncedCallback(calculateBins, 200)

  useEffect(() => {
    setInitializing(true)
    syncActiveBin()
      .then(calculateBins)
      .finally(() => {
        setInitializing(false)
      })
  }, [pair.address])

  const autoShift = (amountX: number = 0, amountY: number = 0) => {
    if (amountX > 0 && amountY === 0) {
      binShiftRef.current = binRangeRef.current[0]
    } else if (amountY > 0 && amountX === 0) {
      binShiftRef.current = binRangeRef.current[1]
    } else {
      binShiftRef.current = 0
    }
  }

  const onChangeBaseAmount = async (value: Decimal) => {
    const amountX = value.toNumber()
    setErrors({ ...omit(errors, ['amountX']) })

    let amountY = amounts.amountY
    if (autoFillRef.current) {
      const pool = await dlmmInstance
      amountY = new Decimal(pool.fromPricePerLamport(Number(activeBinPrice))).mul(value).toNumber()
    }

    autoShift(amountX, amountY)
    setAmounts({ amountX, amountY })
    await calculateBinsThrottle()
  }

  const onMaxBaseAmount = async () => {
    if (balances.balanceX > 0) {
      await onChangeBaseAmount(new Decimal(balances.balanceX))
    }
  }

  const onChangeQuoteAmount = async (value: Decimal) => {
    const amountY = value.toNumber()
    setErrors({ ...omit(errors, ['amountY']) })

    let amountX = amounts.amountX
    if (autoFillRef.current) {
      const pool = await dlmmInstance
      amountX = value.div(new Decimal(pool.fromPricePerLamport(Number(activeBinPrice)))).toNumber()
    }

    autoShift(amountX, amountY)
    setAmounts({ amountX, amountY })
    await calculateBinsThrottle()
  }

  const onMaxQuoteAmount = async () => {
    if (balances.balanceY > 0) {
      await onChangeQuoteAmount(new Decimal(balances.balanceY))
    }
  }

  const onChangeAutoFill = async (checked: boolean) => {
    autoFillRef.current = checked

    if (loadingBalance || !checked) {
      return
    }

    if (amounts.amountX && amounts.amountX > 0) {
      await onChangeBaseAmount(new Decimal(amounts.amountX))
    } else if (amounts.amountY && amounts.amountY > 0) {
      await onChangeQuoteAmount(new Decimal(amounts.amountY))
    }
  }

  const onReset = async () => {
    binShiftRef.current = 0
    await calculateBinsThrottle()
  }

  const onChangeStrategy = async (strategy: string) => {
    setStrategy(strategy)
    await calculateBinsThrottle()
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
              <Switch className="ms-1" onCheckedChange={onChangeAutoFill} />
            </div>
            <SlippagePopover defaultValue={slippage.toString()} onChange={value => setSlippage(parseFloat(value))} />
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
            <InputNumeric
              value={amounts.amountX}
              className={cn('h-11 ps-10 text-right', { 'border-red-400': !!errors.amountX })}
              onChange={v => onChangeBaseAmount(new Decimal(v.target.value || 0))}
              disabled={formState.submitting}
            />
            <div className="mt-1 flex justify-between">
              <div className="text-gray flex flex-col text-sm">
                <div className="flex">
                  <span className="me-1">Balance</span>
                  {loadingBalance ? <Skeleton className="ms-1 mt-1 h-4 w-20" /> : balances.balanceX}
                </div>
                {!!amounts.amountX && balances.balanceX <= 0 && (
                  <div className="text-red-400">Insufficient balance</div>
                )}
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
            <InputNumeric
              value={amounts.amountY}
              className={cn('h-11 ps-10 text-right', { 'border-red-400': !!errors.amountY })}
              onChange={v => onChangeQuoteAmount(new Decimal(v.target.value || 0))}
              disabled={formState.submitting}
            />
            <div className="mt-1 flex justify-between">
              <div className="text-gray flex flex-col text-sm">
                <div className="flex">
                  <span className="me-1">Balance</span>
                  {loadingBalance ? <Skeleton className="ms-1 mt-1 h-4 w-20" /> : balances.balanceY}
                </div>
                {!!amounts.amountY && balances.balanceY <= 0 && (
                  <div className="text-red-400">Insufficient balance</div>
                )}
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
            <Button className="cursor-pointer" variant="outline" size="sm" type="button" onClick={onReset}>
              Reset
            </Button>
            <Select defaultValue={strategy} onValueChange={onChangeStrategy} disabled={formState.submitting}>
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
        <DlmmAddLiquidityBins
          binRange={binRange}
          binRangeRef={binRangeRef}
          binShiftRef={binShiftRef}
          bins={bins}
          strategy={strategy}
          activeBinId={activeBinId}
          calculateBinsThrottle={calculateBinsThrottle}
          disabled={formState.submitting}
          xName={pair.mint_x.name}
          yName={pair.mint_y.name}
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
            placeholder="69"
            className="h-11"
            value={Math.abs(binRangeRef.current[0]) + 1 + binRangeRef.current[1]}
            disabled
          />
        </div>
      </div>
      {connected ? (
        <Button
          variant="light"
          type="submit"
          className="cursor-pointer"
          disabled={
            formState.submitting ||
            (!amounts.amountX && !amounts.amountY) ||
            (!!amounts.amountX && balances.balanceX <= 0) ||
            (!!amounts.amountY && balances.balanceY <= 0)
          }
        >
          Add Liquidity
        </Button>
      ) : (
        <ButtonConnect />
      )}
    </form>
  )
}
