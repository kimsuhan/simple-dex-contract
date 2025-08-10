'use client'

import { useAccount } from 'wagmi'
import { TokenBalance } from './TokenBalance'
import { TOKENS } from '@/lib/tokens'
import { useClientOnly } from '@/hooks/useClientOnly'

export function TokenList() {
  const hasMounted = useClientOnly()
  const { isConnected } = useAccount()

  if (!hasMounted) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <span className="mr-2">🪙</span>보유 토큰
      </h3>
      
      {!isConnected ? (
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">지갑을 연결하면 토큰 잔액을 확인할 수 있습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {TOKENS.map((token, index) => (
            <TokenBalance key={`${token.address}-${index}`} token={token} />
          ))}
        </div>
      )}
    </div>
  )
}