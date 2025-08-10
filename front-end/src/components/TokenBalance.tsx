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

  if (!address) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{token.symbol}</p>
            <p className="text-sm text-gray-600">{token.name}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-gray-500">지갑을 연결하세요</p>
          </div>
        </div>
      </div>
    )
  }

  if (token.address === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{token.symbol}</p>
            <p className="text-sm text-gray-600">{token.name}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-yellow-600">토큰 주소를 설정하세요</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg animate-pulse">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{token.symbol}</p>
            <p className="text-sm text-gray-600">{token.name}</p>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{token.symbol}</p>
            <p className="text-sm text-gray-600">{token.name}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-red-600">오류 발생</p>
          </div>
        </div>
      </div>
    )
  }

  const formattedBalance = balance 
    ? parseFloat(formatUnits(balance as bigint, token.decimals)).toFixed(4)
    : '0.0000'

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">{token.symbol}</p>
          <p className="text-sm text-gray-600">{token.name}</p>
          <p className="text-xs text-gray-400 font-mono">
            {`${token.address.slice(0, 6)}...${token.address.slice(-4)}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-semibold text-gray-800">
            {formattedBalance}
          </p>
          <p className="text-sm text-gray-600">{token.symbol}</p>
        </div>
      </div>
    </div>
  )
}