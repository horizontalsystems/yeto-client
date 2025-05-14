import Decimal from 'decimal.js'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(text: string, maxLength: number = 15) {
  if (text.length <= maxLength) return text

  const separator = '...'

  const sepLen = separator.length,
    charsToShow = maxLength - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2)

  return text.substring(0, frontChars) + separator + text.substring(text.length - backChars)
}

export function toPercent(value: number | string) {
  return (typeof value === 'string' ? parseFloat(value) : value).toFixed(2) + '%'
}

export function toRounded(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function percentageChange(oldNumber: number | string, newNumber: number | string) {
  if (oldNumber == null || newNumber == null) {
    return null
  }

  const numeric = Number(oldNumber)
  return -((numeric - Number(newNumber)) / numeric) * 100
}

export function percentage(percent: number, total: number) {
  return (percent / 100) * total
}

export function sleep(timeout: number = 1000): Promise<void> {
  console.log('Sleeping', timeout)
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeout)
  })
}

export function formatNumber(
  value: number | string | Decimal,
  decimals: number = 6,
  options: {
    compact?: boolean
    minimumFractionDigits?: number
  } = {}
): string {
  const decimalValue = new Decimal(value)

  // For very small numbers, use scientific notation
  if (decimalValue.abs().gt(0) && decimalValue.abs().lt(new Decimal('0.000001'))) {
    return decimalValue.toExponential(decimals)
  }

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options.minimumFractionDigits ?? decimals,
    maximumFractionDigits: decimals,
    notation: options.compact ? 'compact' : 'standard'
  })

  return formatter.format(decimalValue.toNumber())
}

export function formatPrice(value: number | string | Decimal, decimals: number = 6): string {
  return formatNumber(value || 0, decimals, {
    minimumFractionDigits: Math.min(decimals, 2)
  })
}

export function formatRawValue(value: string, decimals: number = 0) {
  return new Decimal(value.length ? value : 0).div(10 ** decimals)
}

export function formatUsd(value: number | string | Decimal, decimals: number = 6): string {
  return '$' + formatNumber(value || 0, decimals, { minimumFractionDigits: Math.min(decimals, 2) })
}
