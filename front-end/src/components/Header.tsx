'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import { useClientOnly } from '@/hooks/useClientOnly'
import { FaWallet, FaExchangeAlt, FaCircle } from 'react-icons/fa'
import { MdAccountBalanceWallet } from 'react-icons/md'

export function Header() {
  const hasMounted = useClientOnly()
  const { address, isConnecting, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    connect({ connector: metaMask() })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
              <FaExchangeAlt className="mr-3 text-blue-600" />
              SimpleDex
            </h1>
            <span className="hidden sm:inline-block px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-medium">
              데모
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {hasMounted && isConnected && address && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm text-gray-600">연결된 지갑</span>
                <span className="text-xs font-mono text-gray-800">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {!hasMounted ? (
                <div className="px-4 py-2 bg-gray-200 text-gray-400 rounded-lg text-sm font-medium animate-pulse">
                  로딩 중...
                </div>
              ) : isConnecting ? (
                <button
                  disabled
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm font-medium"
                >
                  연결 중...
                </button>
              ) : isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <FaCircle className="text-green-500 text-xs animate-pulse" />
                    <span className="hidden sm:inline text-sm text-green-600 font-medium">연결됨</span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                  >
                    <MdAccountBalanceWallet className="mr-2" />
                    연결 해제
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                >
                  <FaWallet className="mr-2" />
                  지갑 연결
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}