'use client'

import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { SIMPLE_DEX_ABI, SIMPLE_DEX_ADDRESS } from '@/lib/dex'
import { TOKENS } from '@/lib/tokens'
import { useClientOnly } from '@/hooks/useClientOnly'

export function DexInfo() {
  const hasMounted = useClientOnly()
  
  // 풀 정보 조회 (클라이언트에서만)
  const { data: poolData } = useReadContract({
    address: SIMPLE_DEX_ADDRESS,
    abi: SIMPLE_DEX_ABI,
    functionName: 'pools',
    args: [TOKENS[0].address, TOKENS[1].address],
    query: {
      enabled: hasMounted &&
               SIMPLE_DEX_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
               TOKENS[0].address !== '0x0000000000000000000000000000000000000000' &&
               TOKENS[1].address !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 3000, // 3초마다 풀 정보 새로고침
    },
  })

  if (!hasMounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
          <span className="mr-2">📊</span>
          DEX 정보
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (SIMPLE_DEX_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">DEX 정보</h3>
        <div className="text-center py-4">
          <p className="text-yellow-700 mb-3">SimpleDex 컨트랙트 주소를 설정해주세요.</p>
          <div className="bg-yellow-100 p-3 rounded-lg text-left">
            <p className="text-sm text-yellow-800 font-semibold mb-2">설정 방법:</p>
            <ol className="text-xs text-yellow-700 space-y-1">
              <li>1. 백엔드에서 SimpleDex 컨트랙트를 배포하세요</li>
              <li>2. 배포된 주소를 복사하세요</li>
              <li>3. <code className="bg-yellow-200 px-1 rounded">src/lib/dex.ts</code>에서 주소를 업데이트하세요</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  // poolData에서 값 추출
  const tokenAReserve = poolData ? (poolData as any)[0] : 0n
  const tokenBReserve = poolData ? (poolData as any)[1] : 0n  
  const totalLiquidity = poolData ? (poolData as any)[2] : 0n

  // 환율 계산
  const exchangeRate = tokenAReserve && tokenBReserve && tokenAReserve > 0n 
    ? parseFloat(formatUnits(tokenBReserve as bigint, 18)) / parseFloat(formatUnits(tokenAReserve as bigint, 18))
    : 0

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
        <span className="mr-2">📊</span>
        DEX 정보
      </h3>

      <div className="space-y-4">
        {/* Contract Address */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">컨트랙트 주소</h4>
          <p className="text-xs font-mono text-gray-600 break-all">
            {SIMPLE_DEX_ADDRESS}
          </p>
        </div>

        {/* Token Pair */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-3">거래 쌍</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">{TOKENS[0].symbol}</span>
              <span className="text-xs font-mono text-blue-600">
                {TOKENS[0].address ? `${TOKENS[0].address.slice(0, 6)}...${TOKENS[0].address.slice(-4)}` : 'Loading...'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">{TOKENS[1].symbol}</span>
              <span className="text-xs font-mono text-blue-600">
                {TOKENS[1].address ? `${TOKENS[1].address.slice(0, 6)}...${TOKENS[1].address.slice(-4)}` : 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Liquidity Info */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-3">유동성 정보</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">총 {TOKENS[0].symbol}:</span>
              <span className="font-mono text-green-800">
                {tokenAReserve ? parseFloat(formatUnits(tokenAReserve as bigint, 18)).toFixed(4) : '0.0000'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">총 {TOKENS[1].symbol}:</span>
              <span className="font-mono text-green-800">
                {tokenBReserve ? parseFloat(formatUnits(tokenBReserve as bigint, 18)).toFixed(4) : '0.0000'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">총 유동성:</span>
              <span className="font-mono text-green-800">
                {totalLiquidity ? parseFloat(formatUnits(totalLiquidity as bigint, 18)).toFixed(4) : '0.0000'}
              </span>
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-3">현재 환율</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-700">1 {TOKENS[0].symbol} =</span>
              <span className="font-mono text-purple-800">
                {exchangeRate.toFixed(6)} {TOKENS[1].symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">1 {TOKENS[1].symbol} =</span>
              <span className="font-mono text-purple-800">
                {exchangeRate > 0 ? (1 / exchangeRate).toFixed(6) : '0.000000'} {TOKENS[0].symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">상태</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              tokenAReserve && tokenBReserve && tokenAReserve > 0n && tokenBReserve > 0n
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}></div>
            <span className={`text-sm ${
              tokenAReserve && tokenBReserve && tokenAReserve > 0n && tokenBReserve > 0n
                ? 'text-green-700'
                : 'text-red-700'
            }`}>
              {tokenAReserve && tokenBReserve && tokenAReserve > 0n && tokenBReserve > 0n
                ? '활성 (유동성 존재)'
                : '비활성 (유동성 필요)'
              }
            </span>
          </div>
        </div>

        {/* Development Status */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <span className="mr-2">🎉</span>
            개발 현황
          </h4>
          <div className="space-y-1 text-sm text-green-700">
            <div className="flex justify-between">
              <span>✅ 유동성 추가:</span>
              <span className="font-semibold">완료</span>
            </div>
            <div className="flex justify-between">
              <span>✅ 토큰 스왑:</span>
              <span className="font-semibold">완료</span>
            </div>
            <div className="flex justify-between">
              <span>🚧 유동성 제거:</span>
              <span className="font-semibold">개발 중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}