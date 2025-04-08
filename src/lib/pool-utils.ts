import DLMM, { StrategyType } from '@meteora-ag/dlmm'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, getMint } from '@solana/spl-token'
import { BN } from '@coral-xyz/anchor'
import { SOL_TOKEN_MINT } from '@/lib/constants'

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

export async function getBalance(connection: Connection, walletPubkey: PublicKey, tokenPubkey: PublicKey) {
  try {
    if (tokenPubkey.toBase58() === SOL_TOKEN_MINT) {
      const balance = await connection.getBalance(walletPubkey, 'confirmed')
      return balance / LAMPORTS_PER_SOL
    }

    const userTokenAddress = getAssociatedTokenAddressSync(tokenPubkey, walletPubkey)
    const balance = await connection.getTokenAccountBalance(userTokenAddress, 'confirmed')
    return balance.value.uiAmount || 0
  } catch (e) {
    console.log(e)
    return 0
  }
}
