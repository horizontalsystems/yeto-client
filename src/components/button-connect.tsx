'use client'

import { useEffect, useRef, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ChevronDown } from 'lucide-react'

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}..${address.slice(-4)}`
}

export function ButtonConnect() {
  const { wallet, publicKey, connected, connect, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wallet && !connected && !connecting) {
      connect().catch(err => console.error('Auto-connect failed:', err))
    }
  }, [wallet, connected, connecting, connect])

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
    }
    setDropdownOpen(false)
  }

  const handleChangeWallet = async () => {
    localStorage.removeItem('walletName')
    await disconnect() // Optional
    setVisible(true)
    setDropdownOpen(false)
  }

  const handleConnect = async () => {
    try {
      await connect()
    } catch (e) {
      console.error(e)
    }
    setDropdownOpen(false)
  }

  const handleDisconnect = async () => {
    await disconnect()
    setDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <div className="relative z-50 inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => {
          if (!wallet) {
            setVisible(true)
          } else {
            setDropdownOpen(prev => !prev)
          }
        }}
        className="bg-blue flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow transition hover:bg-blue-400"
      >
        {wallet?.adapter?.icon && <img src={wallet.adapter.icon} alt="wallet icon" className="h-5 w-5 rounded-full" />}
        {connected && publicKey
          ? shortenAddress(publicKey.toBase58())
          : wallet
            ? wallet.adapter.name
            : 'Connect Wallet'}
        <ChevronDown className="ml-1 h-4 w-4" />
      </button>

      {dropdownOpen && wallet && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-700 bg-[#1f1f1f] text-white shadow-lg">
          {!connected && (
            <button onClick={handleConnect} className="block w-full px-4 py-2 text-left hover:bg-gray-700">
              Connect to {wallet.adapter.name}
            </button>
          )}

          {connected && publicKey && (
            <button onClick={handleCopy} className="block w-full px-4 py-2 text-left hover:bg-gray-700">
              Copy address
            </button>
          )}

          <button onClick={handleChangeWallet} className="block w-full px-4 py-2 text-left hover:bg-gray-700">
            Change wallet
          </button>

          {connected && (
            <button onClick={handleDisconnect} className="block w-full px-4 py-2 text-left hover:bg-gray-700">
              Disconnect
            </button>
          )}
        </div>
      )}
    </div>
  )
}
