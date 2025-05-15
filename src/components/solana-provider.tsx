'use client'

import { type ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { useClusterUrl } from '@/hooks/use-cluster-url'
import {
  CoinbaseWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets'

import '../styles/solana-wallet-connect.css'

export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const endpoint = useClusterUrl()

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
