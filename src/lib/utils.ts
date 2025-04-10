import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

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

export function toRounded(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function u16ToBuffer(value: number): Buffer {
  const buffer = Buffer.alloc(2)
  buffer.writeUInt16LE(value, 0)
  return buffer
}

export function derivePresetParameter(programId: PublicKey, binStep: number, baseFactor: number) {
  const [publicKey] = PublicKey.findProgramAddressSync(
    [Buffer.from('preset_parameter', 'utf8'), u16ToBuffer(binStep), u16ToBuffer(baseFactor)],
    programId
  )

  return publicKey
}

export function binIdToBinArrayIndex(binId: BN): BN {
  const MAX_BIN_ARRAY_SIZE = new BN(70)
  const { div: idx, mod } = binId.divmod(MAX_BIN_ARRAY_SIZE)
  return binId.isNeg() && mod != 0 ? idx.sub(new BN(1)) : idx
}

export function percentageChange(oldNumber: number, newNumber: number) {
  if (!oldNumber || !newNumber) {
    return null
  }

  return -((oldNumber - newNumber) / oldNumber) * 100
}

export function percentage(percent: number, total: number) {
  return (percent / 100) * total
}
