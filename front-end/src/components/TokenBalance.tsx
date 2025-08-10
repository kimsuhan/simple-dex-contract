'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { TokenInfo, ERC20_ABI } from '@/lib/tokens'
import { useClientOnly } from '@/hooks/useClientOnly'

interface TokenBalanceProps {
  token: TokenInfo
}

export function TokenBalance({ token }: TokenBalanceProps) {
  const hasMounted = useClientOnly()
  const { address } = useAccount()

  const { data: balance, isError, isLoading } = useReadContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: hasMounted && !!address && token.address !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 5000, // 5초마다 자동 새로고침
    },
  })

  const formattedBalance = balance 
    ? parseFloat(formatUnits(balance as bigint, token.decimals)).toFixed(4)
    : '0.0000'

  if (!address) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">{token.symbol.charAt(0)}</span>
          </div>
          <span className="font-medium text-sm text-gray-700">{token.symbol}</span>
        </div>
        <span className="text-xs text-gray-500">지갑 연결 필요</span>
      </div>
    )
  }

  if (token.address === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-700">{token.symbol.charAt(0)}</span>
          </div>
          <span className="font-medium text-sm text-yellow-800">{token.symbol}</span>
        </div>
        <span className="text-xs text-yellow-600">주소 설정 필요</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-12"></div>
        </div>
        <div className="h-4 bg-gray-300 rounded w-16"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-red-700">{token.symbol.charAt(0)}</span>
          </div>
          <span className="font-medium text-sm text-red-800">{token.symbol}</span>
        </div>
        <span className="text-xs text-red-600">오류</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">{token.symbol.charAt(0)}</span>
        </div>
        <div>
          <p className="font-medium text-sm text-gray-800">{token.symbol}</p>
          <p className="text-xs text-gray-500 font-mono">
            {`${token.address.slice(0, 6)}...${token.address.slice(-4)}`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-semibold text-gray-900">
          {formattedBalance}
        </p>
      </div>
    </div>
  )
}