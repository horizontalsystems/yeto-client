'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js'
import { Slider } from '@/components/ui/slider'

Chart.register(BarController, BarElement, LinearScale, CategoryScale)

export type BinItem = {
  liquidity: string
  binId: number
}

interface DlmmWithdrawBinsProps {
  activeBinId: number
  bins: BinItem[]
  binRangeRef: React.RefObject<number[]>
  disabled: boolean
}

const colors = {
  activeBin: '#82ca9d',
  tokenX: '#BE46FF',
  tokenY: '#2848FF'
}

export function DlmmWithdrawBins({ bins, activeBinId, binRangeRef, disabled }: DlmmWithdrawBinsProps) {
  const liquidityCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const liquidityChartRef = useRef<Chart | null>(null)

  const drawChart = useCallback(() => {
    const ctx = liquidityCanvasRef.current?.getContext('2d')
    if (!ctx) return
    if (!liquidityChartRef.current) {
      liquidityChartRef.current = createChart(ctx, 0)
    }

    const chart = liquidityChartRef.current
    const [min, max] = binRangeRef.current
    chart.data.labels = bins.map(bin => bin.binId.toString())
    chart.data.datasets[0].data = bins.map(bin => parseInt(bin.liquidity))
    chart.data.datasets[0].backgroundColor = bins.map(bin => {
      if (bin.binId < min && bin.binId < activeBinId) return '#808085'
      if (bin.binId > max && bin.binId > activeBinId) return '#808085'
      return bin.binId === activeBinId ? colors.activeBin : '#4B4B4B'
    })
    chart.update()
  }, [activeBinId, binRangeRef, bins])

  useEffect(() => {
    drawChart()
  }, [bins, drawChart])

  const onRangeChange = (v: number[]) => {
    binRangeRef.current = v
    drawChart()
  }

  return (
    <div className="my-4">
      <div className="relative h-20 w-full">
        <canvas ref={liquidityCanvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <Slider
        defaultValue={binRangeRef.current}
        min={binRangeRef.current[0]}
        max={binRangeRef.current[1]}
        step={1}
        onValueChange={onRangeChange}
        disabled={bins.length === 0 || disabled}
      />
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
