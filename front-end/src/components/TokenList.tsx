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
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">보유 토큰</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">보유 토큰</h3>
        <p className="text-gray-500 text-center py-4">
          지갑을 연결하면 토큰 잔액을 확인할 수 있습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">보유 토큰</h3>
      <div className="space-y-3">
        {TOKENS.map((token, index) => (
          <TokenBalance key={`${token.address}-${index}`} token={token} />
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2 text-sm">💡 토큰 주소 설정</h4>
        <p className="text-xs text-blue-700">
          실제 토큰 주소를 확인하려면:
        </p>
        <ol className="text-xs text-blue-600 mt-1 list-decimal list-inside space-y-1">
          <li>스마트 컨트랙트를 배포하세요</li>
          <li>배포된 토큰 주소를 확인하세요</li>
          <li><code className="bg-blue-100 px-1 rounded">src/lib/tokens.ts</code>에서 주소를 업데이트하세요</li>
        </ol>
      </div>
    </div>
  )
}