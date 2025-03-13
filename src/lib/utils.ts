import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

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

export function toAmount(value: number | string) {
  return usd.format(typeof value === 'string' ? parseFloat(value) : value)
}

export function toPercent(value: number | string) {
  return (typeof value === 'string' ? parseFloat(value) : value).toFixed(2) + '%'
}
