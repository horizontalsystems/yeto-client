import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import Image from 'next/image'

export function ButtonConnectIcon() {
  const { wallet, publicKey, connected } = useWallet()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <div />
  }

  return (
    <>
      {wallet?.adapter?.icon && (
        <Image
          src={wallet.adapter.icon}
          alt="Wallet Adapter Icon"
          className="h-5 w-5 rounded-full"
          width="20"
          height="20"
        />
      )}
      {connected && publicKey ? shortenAddress(publicKey.toBase58()) : wallet ? wallet.adapter.name : 'Connect Wallet'}
    </>
  )
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}..${address.slice(-4)}`
}
