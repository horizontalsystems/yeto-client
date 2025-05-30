'use client'

import Decimal from 'decimal.js'
import DLMM from '@yeto/dlmm/ts-client'
import { DlmmListSkeleton } from '@/components/dlmm/dlmm-list-skeleton'
import { useCallback, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { MyPoolListItem, Position } from '@/components/my-board/my-pool-list-item'
import { getPoolsByAddress } from '@/lib/api'
import { Pair } from '@/components/dlmm/dlmm'
import { BN } from '@coral-xyz/anchor'
import { toast } from 'sonner'
import { linkToSolscan } from '@/lib/ui-utils'
import { useConnection } from '@/hooks/use-connection'

type MyPair = {
  pair: Pair
  positions: Position[]
}

export function MyPoolList({ poolAddress }: { poolAddress?: string }) {
  const { publicKey: walletPubKey, sendTransaction } = useWallet()
  const [positions, setPositions] = useState<MyPair[]>([])
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState<{ submitting: boolean; error?: string }>({
    submitting: false
  })

  const connection = useConnection()
  const dlmmInstance = useCallback((address: string) => DLMM.create(connection, new PublicKey(address)), [connection])

  const onClosePosition = async (address: string, positionAddress: string) => {
    if (!walletPubKey) {
      return
    }

    try {
      setFormState({ submitting: true })

      const dlmmPool = await dlmmInstance(address)
      const position = await dlmmPool.getPosition(new PublicKey(positionAddress))

      let withdrawTx = await dlmmPool.removeLiquidity({
        user: walletPubKey,
        position: new PublicKey(positionAddress),
        binIds: [position.positionData.lowerBinId, position.positionData.upperBinId],
        bps: new BN(100 * 100),
        shouldClaimAndClose: true
      })

      if (Array.isArray(withdrawTx)) {
        withdrawTx = withdrawTx[0]
      }

      sendTransaction(withdrawTx, connection)
        .then(signature => {
          setFormState({ submitting: false })
          toast.success('Position closed', {
            duration: 5000,
            description: linkToSolscan(signature)
          })
        })
        .catch(e => {
          console.error(e)
          setFormState({ submitting: false })
          toast.error('Failed to close position', { description: e.message })
        })
    } catch (e) {
      console.log(e)

      let error = 'Failed to close position'
      if (e instanceof Error) error = e.message
      setFormState({ submitting: false, error })
      toast.error('Failed to close position˚', { description: error })
    }
  }

  useEffect(() => {
    if (!walletPubKey) {
      return
    }

    const getPositions = async () => {
      setLoading(true)
      const pairPositions = await DLMM.getAllLbPairPositionsByUser(connection, walletPubKey)
      const items: MyPair[] = []
      const pools: { [key: string]: Pair } = await getPoolsByAddress(pairPositions.keys().toArray())

      const entries = pairPositions.entries()

      for (const [address, info] of entries) {
        const pair = pools[address]
        if (!pair || (poolAddress && poolAddress !== address)) {
          continue
        }

        items.push({
          pair,
          positions: info.lbPairPositionsData.map(({ publicKey, positionData }) => {
            const positionBinData = positionData.positionBinData

            const xLamports = 10 ** pair.mint_x.decimals
            const yLamports = 10 ** pair.mint_y.decimals

            const amountX = new Decimal(positionData.totalXAmount).div(xLamports)
            const amountY = new Decimal(positionData.totalYAmount).div(yLamports)

            const totalDeposit = amountX.mul(pair.current_price).add(amountY)

            const feeX = new Decimal(positionData.feeX.toNumber()).div(xLamports)
            const feeY = new Decimal(positionData.feeY.toNumber()).div(yLamports)
            const totalFee = feeX.mul(pair.current_price).add(feeY)

            return {
              address: publicKey.toBase58(),
              totalDeposit: totalDeposit.toString(),
              unclaimedFee: totalFee.toString(),
              minPrice: positionBinData[0].pricePerToken,
              maxPrice: positionBinData[positionBinData.length - 1].pricePerToken,
              isOutOfRange:
                info.lbPair.activeId > positionData.upperBinId || info.lbPair.activeId < positionData.lowerBinId
            }
          })
        })
      }

      setPositions(items)
      setLoading(false)
    }

    getPositions()
  }, [connection, walletPubKey])

  if (loading) {
    return <DlmmListSkeleton withSearchInput={false} />
  }

  return (
    <div className="w-full text-sm">
      <div className="text-gray bg-card flex w-full text-xs">
        <div className="w-2/4 px-6 py-3 font-medium">Pool</div>
        <div className="w-1/4 px-6 py-3 font-medium">Total Deposit</div>
        <div className="w-1/4 px-6 py-3 font-medium">Unclaimed Fee</div>
        <div className="w-1/4 px-6 py-3 font-medium">APR (24h)</div>
        <div className="w-1/4 px-6 py-3 font-medium">Current Price</div>
      </div>
      {positions.map((pool, index: number) => {
        return (
          <MyPoolListItem
            key={index}
            pair={pool.pair}
            positions={pool.positions}
            onClosePosition={onClosePosition}
            isLoading={formState.submitting}
          />
        )
      })}
      {positions.length < 1 && <div className="p-6">No positions</div>}
    </div>
  )
}
