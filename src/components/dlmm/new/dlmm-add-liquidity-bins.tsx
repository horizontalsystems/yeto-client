'use client'

import React, { useEffect, useRef, useState } from 'react'
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js'
import { DebouncedState } from 'use-debounce'
import { Slider } from '@/components/ui/slider'

Chart.register(BarController, BarElement, LinearScale, CategoryScale)

export type BinItem = {
  liquidity: string
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
  disabled
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
      if (item) {
        newBins.push(item)
      } else {
        newBins.push({
          liquidity: '0',
          amountX: '0',
          amountY: '0',
          activeBin: activeBinId === i,
          binId: i
        })
      }
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
      strategyChartRef.current = createChart(ctx, 4)
    }

    const minBinId = activeBinId + binRangeRef.current[0] - binShiftRef.current
    const maxBinId = activeBinId + binRangeRef.current[1] - binShiftRef.current
    const filtered = binsCopy.filter(bin => bin.binId >= minBinId && bin.binId <= maxBinId)

    const chart = strategyChartRef.current
    chart.data.labels = filtered.map(bin => bin.binId.toString())
    chart.data.datasets[0].data = filtered.map(bin => {
      let range = 40
      if (strategy === 'Bid-Ask') {
        const distance = Math.abs(bin.binId - activeBinId)
        range = bin.binId === activeBinId ? 1 : distance
      }
      return range
    })

    chart.data.datasets[0].backgroundColor = filtered.map(bin => {
      if (bin.binId < activeBinId) return colors.tokenX
      if (bin.binId > activeBinId) return colors.tokenY
      return colors.activeBin
    })
    chart.update()
  }, [binsCopy, strategy, activeBinId, binRangeRef, binShiftRef])

  // Liquidity
  useEffect(() => {
    const ctx = liquidityCanvasRef.current?.getContext('2d')
    if (!ctx) return
    if (!liquidityChartRef.current) {
      liquidityChartRef.current = createChart(ctx, 0)
    }

    const chart = liquidityChartRef.current
    const [min, max] = binRangeRef.current
    chart.data.labels = binsCopy.map(bin => bin.binId.toString())
    chart.data.datasets[0].data = binsCopy.map(bin => parseInt(bin.liquidity))
    chart.data.datasets[0].backgroundColor = binsCopy.map(bin => {
      if (bin.binId < activeBinId + min && bin.binId < activeBinId) return '#808085'
      if (bin.binId > activeBinId + max && bin.binId > activeBinId) return '#808085'
      return bin.binId === activeBinId ? colors.activeBin : '#4B4B4B'
    })
    chart.update()
  }, [binsCopy, strategy, activeBinId, binRangeRef])

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
        <div className="relative h-20 w-full">
          <canvas ref={strategyCanvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
        <Slider
          defaultValue={[0]}
          min={binRangeRef.current[0]}
          max={binRangeRef.current[1]}
          step={1}
          className="w-full"
          onValueChange={onShiftBin}
          disabled={binsCopy.length === 0 || disabled}
        />
      </div>
      <div className="my-4">
        <div className="relative h-20 w-full">
          <canvas ref={liquidityCanvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
        <Slider
          defaultValue={binRange}
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

function createChart(ctx: CanvasRenderingContext2D, radius: number) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderRadius: radius
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300
      },
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  })
}
