import DLMM, { StrategyType } from '@meteora-ag/dlmm'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { getMint } from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'

export async function createBalancePosition(
  pool: DLMM,
  amountX: number,
  amountY: number,
  minBinId: BN,
  maxBinId: BN,
  user: PublicKey,
  connection: Connection,
  strategy: StrategyType
) {
  const baseMint = await getMint(connection, pool.tokenX.publicKey)
  const quoteMint = await getMint(connection, pool.tokenY.publicKey)

  const totalXAmount = new BN(amountX * 10 ** baseMint.decimals)
  const totalYAmount = new BN(amountY * 10 ** quoteMint.decimals)
  // const totalYAmount = autoFillYByStrategy(
  //   activeBin.binId,
  //   pool.lbPair.binStep,
  //   totalXAmount,
  //   activeBin.xAmount,
  //   activeBin.yAmount,
  //   minBinId,
  //   maxBinId,
  //   strategy
  // )

  const newBalancePosition = new Keypair()

  // Create Position
  const createPositionTx = await pool.initializePositionAndAddLiquidityByStrategy({
    positionPubKey: newBalancePosition.publicKey,
    user: user,
    totalXAmount,
    totalYAmount,
    strategy: {
      maxBinId,
      minBinId,
      strategyType: strategy
    }
  })

  return {
    createPositionTx,
    newBalancePosition
  }
}
