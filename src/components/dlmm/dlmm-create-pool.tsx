'use client'

import DLMM from '@meteora-ag/dlmm'
import { SyntheticEvent, useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectNumber } from '@/components/select-number'
import { SelectCoinAutocomplete } from '@/components/select-coin-autocomplete'
import { ApiCoinItem } from '@/lib/api'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { derivePresetParameter, u16ToBuffer } from '@/lib/utils'
import { useWallet } from '@solana/wallet-adapter-react'
import { BN } from '@coral-xyz/anchor'
import { DLMM_PROGRAM_IDS } from '@/lib/constants'
import { omit, parseInt } from 'es-toolkit/compat'
import { ButtonConnect } from '@/components/button-connect'

interface DlmmCreatePoolProps {
  onCreate: (address: string) => void
  onClickNext: (address: string) => void
}

export function DlmmCreatePool({ onCreate, onClickNext }: DlmmCreatePoolProps) {
  const { publicKey: walletPubKey, connected, sendTransaction } = useWallet()
  const [base, setBase] = useState<ApiCoinItem>()
  const [quote, setQuote] = useState<ApiCoinItem>()
  const [binStep, setBinStep] = useState(0)
  const [baseFee, setBaseFee] = useState(0)
  const [initialPrice, setInitialPrice] = useState(1)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formState, setFormState] = useState<{ submitting: boolean; newPoolAddress?: string; error?: string }>({
    submitting: false
  })

  const handleSubmit = async (v: SyntheticEvent) => {
    v.preventDefault()
    if (!walletPubKey || !connected) {
      return console.error('')
    }

    if (!base) {
      return setErrors({ ...errors, base: 'Base is required' })
    }

    if (!quote) {
      return setErrors({ ...errors, quote: 'Quote is required' })
    }

    try {
      setFormState({ submitting: true })

      const endpoint = clusterApiUrl('devnet')
      const connection = new Connection(endpoint)

      const programId = new PublicKey(DLMM_PROGRAM_IDS.devnet)
      const tokenMintX = new PublicKey(base.address)
      const tokenMintY = new PublicKey(quote.address)
      const baseFactor = (baseFee * 10000 ** 2) / (100 * binStep)

      const [poolAddress] = PublicKey.findProgramAddressSync(
        [tokenMintX.toBuffer(), tokenMintY.toBuffer(), u16ToBuffer(binStep), u16ToBuffer(baseFactor)],
        programId
      )

      const accountInfo = await connection.getAccountInfo(poolAddress)
      if (accountInfo) {
        return setErrors({ ...errors, poolExists: 'Pool already exists. You can proceed to deposit into the pool.' })
      } else {
        setErrors({ ...omit(errors, ['poolExists']) })
      }

      const presetParamAddress = derivePresetParameter(programId, binStep, baseFactor)
      const rawTx = await DLMM.createLbPair(
        connection,
        walletPubKey,
        tokenMintX,
        tokenMintY,
        new BN(binStep),
        new BN(baseFactor),
        presetParamAddress,
        new BN(initialPrice || 1),
        { cluster: 'devnet', programId }
      )

      const signature = await sendTransaction(rawTx, connection)
      console.log('signature', signature)
      setFormState({ submitting: false, newPoolAddress: poolAddress.toBase58() })
      onCreate(poolAddress.toBase58())
    } catch (e) {
      console.log(e)
      let error = 'Failed to create pool'
      if (e instanceof Error) {
        error = e.message
      }

      setFormState({ submitting: false, error })
    }
  }

  const onSelectBase = (v: ApiCoinItem) => {
    setBase(v)
    setErrors({ ...omit(errors, ['base']) })
  }

  const onSelectQuote = (v: ApiCoinItem) => {
    setQuote(v)
    setErrors({ ...omit(errors, ['quote']) })
  }

  const actions = () => {
    const newPoolAddress = formState.newPoolAddress
    if (newPoolAddress) {
      return (
        <Button
          variant="default"
          type="button"
          className="mt-6 cursor-pointer"
          onClick={() => onClickNext(newPoolAddress)}
        >
          Next
        </Button>
      )
    }
    if (connected) {
      return (
        <Button variant="light" type="submit" className="mt-6 cursor-pointer" disabled={formState.submitting}>
          Create Pool
        </Button>
      )
    }

    return (
      <div className="mt-6">
        <ButtonConnect />
      </div>
    )
  }

  return (
    <form className="p-6" onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="mb-3">Select Tokens</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <SelectCoinAutocomplete
              onSelect={onSelectBase}
              error={errors.base}
              placeholder="Base Token"
              disabled={formState.submitting}
            />
            {errors.base && <div className="mt-1 text-sm text-red-400">{errors.base}</div>}
          </div>
          <div>
            <SelectCoinAutocomplete
              onSelect={onSelectQuote}
              error={errors.quote}
              placeholder="Quote Token"
              disabled={formState.submitting}
            />
            {errors.quote && <div className="mt-1 text-sm text-red-400">{errors.quote}</div>}
          </div>
        </div>
        <div className="text-muted-foreground pt-2 text-sm">
          For SOL-USDC, SOL is usually the Base token, and USDC is the Quote token representing the price of SOL.
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          <SelectNumber
            placeholder="Base Fee"
            items={['0.01', '0.02', '0.03', '0.04', '0.05', '0.06']}
            onChange={setBaseFee}
            disabled={formState.submitting}
          />
          <SelectNumber
            placeholder="Bin Step"
            items={['1', '5', '8', '10', '15', '25']}
            onChange={setBinStep}
            disabled={formState.submitting}
          />
        </div>
      </div>
      <div className="mb-6">
        <div className="mb-3">Input Price</div>
        <Input
          type="number"
          placeholder="1"
          onChange={v => setInitialPrice(parseInt(v.target.value))}
          disabled={formState.submitting}
        />
        <div className="text-muted-foreground pt-2 text-sm">
          Please verify that this price matches the current market price to avoid losing initial liquidity.
        </div>
      </div>
      {errors.poolExists && (
        <div className="mb-6 rounded-lg border border-yellow-400 p-4">
          <div className="flex flex-row">
            <Info className="text-yellow-400" />
            <span className="ms-2 text-yellow-400">A pool with these parameters already exists.</span>
          </div>
          <div className="mt-2 text-sm">
            A pool with this token pair, base fee, and bin step already exists. Visit the pool page or click Next to add
            liquidity.
          </div>
        </div>
      )}
      {formState.newPoolAddress && (
        <div className="mb-6 rounded-lg border border-green-400 p-4">
          <div className="flex flex-row">
            <Info className="text-green-400" />
            <span className="ms-2 text-green-400">Pool created successfully!</span>
          </div>
          <div className="mt-2 text-sm">
            The pool page is available here. You can explore it or click Next to add liquidity to this pool.
          </div>
        </div>
      )}
      <hr className="divider" />
      {actions()}
    </form>
  )
}
