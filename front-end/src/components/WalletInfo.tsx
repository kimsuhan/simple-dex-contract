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
      refetchInterval: 5000,
    },
  })

  if (!hasMounted) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isConnected || !address) {
    return (
      <div className="bg-gray-50 rounded-lg border p-4 text-center">
        <p className="text-sm text-gray-500">지갑을 연결해주세요</p>
      </div>
    )
  }

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Mainnet'
      case 11155111:
        return 'Sepolia'
      case 31337:
        return 'Local'
      default:
        return `Chain ${chainId}`
    }
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <span className="mr-2">👛</span>지갑 정보
        </h3>
        <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
          {getChainName(chainId)}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">주소</span>
          <span className="text-xs font-mono text-gray-700">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">ETH 잔액</span>
          <span className="text-sm font-semibold text-gray-900">
            {balance ? 
              `${parseFloat(formatEther(balance.value)).toFixed(4)} ETH` : 
              '로딩...'
            }
          </span>
        </div>
      </div>
    </div>
  )
}