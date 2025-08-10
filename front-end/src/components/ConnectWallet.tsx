'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

export function ConnectWallet() {
  const { address, isConnecting, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    connect({ connector: metaMask() })
  }

  if (isConnecting) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
      >
        연결 중...
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-green-100 text-green-800 rounded-lg">
          <p className="font-semibold">지갑 연결됨!</p>
          <p className="text-sm font-mono">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          연결 해제
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
    >
      MetaMask 연결하기
    </button>
  )
}