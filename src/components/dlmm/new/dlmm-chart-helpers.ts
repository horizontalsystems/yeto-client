import { Chart } from 'chart.js'
import { formatPrice } from '@/lib/utils'

const colors = {
  activeBin: '#82ca9d',
  tokenX: '#2848FF',
  tokenY: '#BE46FF'
}

export function createChartStrategy(ctx: CanvasRenderingContext2D, radius: number, xName: string, yName: string) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: colors.tokenX,
          borderRadius: radius,
          label: xName,
          parsing: {
            xAxisKey: 'value',
            yAxisKey: 'value'
          }
        },
        {
          data: [],
          backgroundColor: colors.tokenY,
          borderRadius: radius,
          label: yName,
          parsing: {
            xAxisKey: 'value',
            yAxisKey: 'value'
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300
      },
      interaction: {
        intersect: false,
        mode: 'x'
      },
      scales: {
        x: {
          display: false,
          stacked: true
        },
        y: {
          display: false,
          stacked: true
        }
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            title: () => '',
            label: () => '',
            afterLabel: context => {
              if (context.raw) {
                const raw = context.raw as { x: number; y: number; value: number }
                const label = context.dataset.label
                const price = context.label

                if ((label === xName && raw.x <= 0) || (label === yName && raw.y <= 0)) {
                  return ''
                }

                const value = label === xName ? raw.x : raw.y
                return `Price: ${price}\n${label}: ${value}`
              } else {
                return ''
              }
            }
          }
        }
      }
    }
  })
}

export function createChartLiquidity(ctx: CanvasRenderingContext2D, radius: number, xName: string, yName: string) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderRadius: radius,
          parsing: {
            xAxisKey: 'value',
            yAxisKey: 'value'
          }
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300
      },
      interaction: {
        intersect: false,
        mode: 'x'
      },
      scales: {
        x: {
          display: false,
          stacked: true
        },
        y: {
          display: false,
          stacked: true
        }
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            title: () => '',
            label: () => '',
            afterLabel: context => {
              if (context.raw) {
                const raw = context.raw as { x: number; y: number }
                let text = `Price: ${formatPrice(context.label)}`
                if (raw.x) {
                  text += `\n${xName}:${raw.x}`
                }
                if (raw.y) {
                  text += `\n${yName}:${raw.y}`
                }

                return text
              } else {
                return ''
              }
            }
          }
        }
      }
    }
  })
}
