'use client'

import { type ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import {
  CoinbaseWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets'

import '@solana/wallet-adapter-react-ui/styles.css'

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
        options: {
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID
        }
      }),
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new MathWalletAdapter(),
      new TrustWalletAdapter(),
      new CoinbaseWalletAdapter()
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
