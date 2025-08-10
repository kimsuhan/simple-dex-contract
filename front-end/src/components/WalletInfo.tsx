'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { useClientOnly } from '@/hooks/useClientOnly'

export function WalletInfo() {
  const hasMounted = useClientOnly()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({
    address,
    query: {
      enabled: hasMounted && !!address,
    },
  })

  if (!hasMounted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">지갑 정보</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isConnected || !address) {
    return null
  }

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet'
      case 11155111:
        return 'Sepolia Testnet'
      case 31337:
        return 'Hardhat Local'
      default:
        return `Unknown (${chainId})`
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">지갑 정보</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            지갑 주소
          </label>
          <div className="p-2 bg-gray-100 rounded font-mono text-sm break-all">
            {address}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            네트워크
          </label>
          <div className="p-2 bg-gray-100 rounded text-sm">
            {getChainName(chainId)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            잔액
          </label>
          <div className="p-2 bg-gray-100 rounded text-sm">
            {balance ? (
              <span>
                {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
              </span>
            ) : (
              '로딩 중...'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}