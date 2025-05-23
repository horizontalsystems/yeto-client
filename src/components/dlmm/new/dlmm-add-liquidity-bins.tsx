'use client'

import React, { useEffect, useRef, useState } from 'react'
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'
import { DebouncedState } from 'use-debounce'
import { Slider } from '@/components/ui/slider'
import { createChartLiquidity, createChartStrategy } from '@/components/dlmm/new/dlmm-chart-helpers'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip)

export type BinItem = {
  liquidity: string
  activeBin: boolean
  distributionX: number
  distributionY: number
  amountX: number
  amountY: number
  price: string
  binId: number
}

interface AddLiquidityBinsProps {
  activeBinId: number
  strategy: string
  bins: BinItem[]
  calculateBinsThrottle: DebouncedState<() => Promise<void>>
  binRangeRef: React.RefObject<number[]>
  binShiftRef: React.RefObject<number>
  binRange: number[]
  disabled: boolean
  xName: string
  yName: string
}

const colors = {
  activeBin: '#82ca9d',
  tokenX: '#BE46FF',
  tokenY: '#2848FF'
}

export function DlmmAddLiquidityBins({
  bins,
  activeBinId,
  strategy,
  binRangeRef,
  binShiftRef,
  binRange,
  calculateBinsThrottle,
  disabled,
  xName,
  yName
}: AddLiquidityBinsProps) {
  const [binsCopy, setBinsCopy] = useState<BinItem[]>([])

  const strategyCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const strategyChartRef = useRef<Chart | null>(null)

  const liquidityCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const liquidityChartRef = useRef<Chart | null>(null)

  const calculateBins = () => {
    const minBinId = activeBinId + binRange[0] - binShiftRef.current
    const maxBinId = activeBinId + binRange[1] - binShiftRef.current

    const existingBins = new Map(bins.map(b => [b.binId, b]))
    const newBins = []

    for (let i = minBinId; i <= maxBinId; i++) {
      const item = existingBins.get(i)
      if (item) newBins.push(item)
    }

    setBinsCopy(newBins)
  }

  useEffect(() => {
    setBinsCopy(bins)
  }, [bins])

  // Strategy
  useEffect(() => {
    const ctx = strategyCanvasRef.current?.getContext('2d')
    if (!ctx) return
    if (!strategyChartRef.current) {
      strategyChartRef.current = createChartStrategy(ctx, 4, xName, yName)
    }

    const minBinId = activeBinId + binRangeRef.current[0] - binShiftRef.current
    const maxBinId = activeBinId + binRangeRef.current[1] - binShiftRef.current
    const filtered = binsCopy.filter(bin => bin.binId >= minBinId && bin.binId <= maxBinId)

    const chart = strategyChartRef.current
    chart.data.labels = filtered.map(bin => bin.price)
    chart.data.datasets[0].data = filtered.map(bin => {
      return {
        x: bin.distributionX,
        y: bin.distributionY,
        value: bin.distributionX
      }
    })
    chart.data.datasets[1].data = filtered.map(bin => {
      return {
        x: bin.distributionX,
        y: bin.distributionY,
        value: bin.distributionY * (1 / Number(bin.price))
      }
    })
    chart.update()
  }, [binsCopy, strategy, activeBinId, binRangeRef, binShiftRef, xName, yName])

  // Liquidity
  useEffect(() => {
    const ctx = liquidityCanvasRef.current?.getContext('2d')
    if (!ctx) return
    if (!liquidityChartRef.current) {
      liquidityChartRef.current = createChartLiquidity(ctx, 0, xName, yName)
    }

    const [min, max] = binRangeRef.current
    const chart = liquidityChartRef.current
    chart.data.labels = binsCopy.map(bin => bin.price)
    chart.data.datasets[0].data = binsCopy.map(bin => {
      return {
        x: bin.amountX,
        y: bin.amountY,
        value: parseInt(bin.liquidity)
      }
    })
    chart.data.datasets[0].backgroundColor = binsCopy.map(bin => {
      if (bin.binId < activeBinId + min && bin.binId < activeBinId) return '#808085'
      if (bin.binId > activeBinId + max && bin.binId > activeBinId) return '#808085'
      return bin.binId === activeBinId ? colors.activeBin : '#4B4B4B'
    })
    chart.update()
  }, [binsCopy, strategy, activeBinId, binRangeRef, xName, yName])

  const onShiftBin = (v: number[]) => {
    binShiftRef.current = v[0]
    calculateBins()
    calculateBinsThrottle()
  }

  const onRangeChange = (v: number[]) => {
    binRangeRef.current = v
    calculateBins()
    calculateBinsThrottle()
  }

  return (
    <div>
      <div className="my-4">
        <div className="h-20 w-full">
          <canvas ref={strategyCanvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
        <Slider
          value={[binShiftRef.current]}
          min={binRangeRef.current[0]}
          max={binRangeRef.current[1]}
          step={1}
          className="mt-[1px] w-full"
          onValueChange={onShiftBin}
          disabled={binsCopy.length === 0 || disabled}
        />
      </div>
      <div className="my-4">
        <div className="relative h-20 w-full">
          <canvas ref={liquidityCanvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
        <Slider
          className="mt-[1px]"
          value={binRangeRef.current}
          min={binRange[0]}
          max={binRange[1]}
          step={1}
          onValueChange={onRangeChange}
          disabled={binsCopy.length === 0 || disabled}
        />
      </div>
    </div>
  )
}
