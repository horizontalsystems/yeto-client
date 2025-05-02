import DLMM, { StrategyType } from '@yeto/dlmm/ts-client'
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

export function binIdToBinArrayIndex(binId: BN): BN {
  const MAX_BIN_ARRAY_SIZE = new BN(70)
  const { div: idx, mod } = binId.divmod(MAX_BIN_ARRAY_SIZE)
  return binId.isNeg() && mod != 0 ? idx.sub(new BN(1)) : idx
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

export function sortTokenMints(tokenX: PublicKey, tokenY: PublicKey) {
  const [minKey, maxKey] = tokenX.toBuffer().compare(tokenY.toBuffer()) == 1 ? [tokenY, tokenX] : [tokenX, tokenY]
  return [minKey, maxKey]
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

export const baseFeePercentages = [0.01, 0.02, 0.03, 0.04, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.6, 0.8, 1, 2, 3]

export function binStepsByBaseFee(baseFee: number) {
  switch (baseFee) {
    case 0.01:
      return [1, 5, 8, 10, 16, 80, 100]
    case 0.02:
      return [2, 5, 10, 80]
    case 0.03:
      return [2, 5, 10, 16, 80]
    case 0.04:
      return [4, 5, 10, 80, 100]
    case 0.05:
      return [8, 50, 80, 100]
    case 0.1:
      return [10, 50, 80, 100]
    case 0.15:
      return [15, 75, 80, 100]
    case 0.2:
      return [20, 80, 100, 125]
    case 0.25:
      return [25, 80, 100, 125, 200]
    case 0.3:
      return [30, 50, 100, 150, 200]
    case 0.4:
      return [50, 100, 160, 200, 400]
    case 0.6:
      return [80, 100]
    case 0.8:
      return [80, 100, 160, 200]
    case 1:
      return [80, 100, 125, 200, 250, 400]
    case 2:
      return [100, 200, 250, 400]
    case 3:
      return [80, 100, 125, 250, 400]
    default:
      return []
  }
}
