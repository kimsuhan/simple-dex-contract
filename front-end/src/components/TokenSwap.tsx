'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { SIMPLE_DEX_ABI, SIMPLE_DEX_ADDRESS } from '@/lib/dex'
import { TOKENS, ERC20_ABI } from '@/lib/tokens'
import { useTokenApproval } from '@/hooks/useTokenApproval'
import { useClientOnly } from '@/hooks/useClientOnly'
import { FaArrowsAltV, FaLock, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'
import { RiTokenSwapLine } from 'react-icons/ri'

export function TokenSwap() {
  const hasMounted = useClientOnly()
  const { address, isConnected } = useAccount()
  const [fromToken, setFromToken] = useState(0) // 0: TTA, 1: TTB
  const [toToken, setToToken] = useState(1)
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
    onSuccess: () => {
      // 스왑 완료 후 모든 관련 데이터 새로고침
      console.log('Swap completed, refreshing all data...')
      refetchFromTokenBalance()
      refetchToTokenBalance()
      refetchPoolData()
      // 입력 필드 초기화
      setAmountIn('')
      setAmountOut('')
    }
  })

  // 토큰 승인 상태
  const fromTokenApproval = useTokenApproval({
    tokenAddress: TOKENS[fromToken].address,
    spenderAddress: SIMPLE_DEX_ADDRESS,
    amount: hasMounted ? amountIn : '',
    decimals: TOKENS[fromToken].decimals,
  })

  // 토큰 잔액 조회
  const { data: fromTokenBalance, refetch: refetchFromTokenBalance } = useReadContract({
    address: TOKENS[fromToken].address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: hasMounted && !!address && TOKENS[fromToken].address !== '0x0000000000000000000000000000000000000000',
    },
  })

  const { data: toTokenBalance, refetch: refetchToTokenBalance } = useReadContract({
    address: TOKENS[toToken].address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: hasMounted && !!address && TOKENS[toToken].address !== '0x0000000000000000000000000000000000000000',
    },
  })

  // 풀 정보 조회
  const { data: poolData, refetch: refetchPoolData } = useReadContract({
    address: SIMPLE_DEX_ADDRESS,
    abi: SIMPLE_DEX_ABI,
    functionName: 'pools',
    args: [TOKENS[0].address, TOKENS[1].address],
    query: {
      enabled:
        hasMounted &&
        SIMPLE_DEX_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
        TOKENS[0].address !== '0x0000000000000000000000000000000000000000' &&
        TOKENS[1].address !== '0x0000000000000000000000000000000000000000',
    },
  })

  // 스왑 가능한 출력 금액 계산
  useEffect(() => {
    if (!amountIn || !poolData || parseFloat(amountIn) <= 0) {
      setAmountOut('')
      return
    }

    try {
      const poolDataArray = poolData as [bigint, bigint, bigint]
      const reserveIn = fromToken === 0 ? poolDataArray[0] : poolDataArray[1]
      const reserveOut = fromToken === 0 ? poolDataArray[1] : poolDataArray[0]

      if (reserveIn === 0n || reserveOut === 0n) {
        setAmountOut('0')
        return
      }

      const amountInWei = parseUnits(amountIn, TOKENS[fromToken].decimals)
      
      // AMM 공식: x * y = k, 0.3% 수수료 적용
      const amountInWithFee = amountInWei * BigInt(997) // 0.3% 수수료
      const numerator = amountInWithFee * reserveOut
      const denominator = (reserveIn * BigInt(1000)) + amountInWithFee
      const calculatedAmountOut = numerator / denominator

      setAmountOut(parseFloat(formatUnits(calculatedAmountOut, TOKENS[toToken].decimals)).toFixed(6))
    } catch (error) {
      console.error('Amount calculation error:', error)
      setAmountOut('0')
    }
  }, [amountIn, poolData, fromToken, toToken])

  const handleSwapTokens = () => {
    const newFromToken = toToken
    const newToToken = fromToken
    setFromToken(newFromToken)
    setToToken(newToToken)
    setAmountIn('')
    setAmountOut('')
  }

  const handleSwap = async () => {
    if (!amountIn || !address || parseFloat(amountIn) <= 0) return

    try {
      const parsedAmountIn = parseUnits(amountIn, TOKENS[fromToken].decimals)

      writeContract({
        address: SIMPLE_DEX_ADDRESS,
        abi: SIMPLE_DEX_ABI,
        functionName: 'swap',
        args: [TOKENS[fromToken].address, TOKENS[toToken].address, parsedAmountIn],
      })
    } catch (error) {
      console.error('Swap failed:', error)
    }
  }

  // SSR 안전성을 위한 로딩 상태
  if (!hasMounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
          <span className="mr-2">🔄</span>
          토큰 스왑
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">토큰 스왑</h3>
        <p className="text-gray-500 text-center py-4">
          지갑을 연결하면 토큰을 스왑할 수 있습니다.
        </p>
      </div>
    )
  }

  if (SIMPLE_DEX_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">토큰 스왑</h3>
        <p className="text-yellow-700 text-center py-4">
          SimpleDex 컨트랙트 주소를 설정해주세요.
        </p>
      </div>
    )
  }

  // 풀이 존재하지 않는 경우
  const poolExists = poolData && (poolData as [bigint, bigint, bigint])[2] > 0n

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
        <RiTokenSwapLine className="mr-2 text-blue-600" />
        토큰 스왑
      </h3>

      {!poolExists ? (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <h4 className="font-semibold text-yellow-800 mb-2">풀이 존재하지 않습니다</h4>
          <p className="text-sm text-yellow-700">
            먼저 유동성을 추가해야 스왑할 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">From</label>
              <span className="text-xs text-gray-500">
                잔액: {fromTokenBalance ? parseFloat(formatUnits(fromTokenBalance as bigint, TOKENS[fromToken].decimals)).toFixed(4) : '0.0000'}
              </span>
            </div>
            <div className="flex space-x-2">
              <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg">
                <span className="font-semibold">{TOKENS[fromToken].symbol}</span>
              </div>
            </div>

            {/* From Token Approval */}
            {amountIn && parseFloat(amountIn) > 0 && (
              <div className="mt-2">
                {fromTokenApproval.needsApproval ? (
                  <div className="flex items-center justify-between bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                    <span className="text-xs text-yellow-700 flex items-center">
                      <FaLock className="mr-1" />
                      {TOKENS[fromToken].symbol} 승인 필요
                    </span>
                    <button
                      onClick={fromTokenApproval.approveMax}
                      disabled={fromTokenApproval.isLoading}
                      className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fromTokenApproval.isLoading ? '승인 중...' : '승인하기'}
                    </button>
                  </div>
                ) : fromTokenApproval.allowance !== undefined && fromTokenApproval.allowance > 0n ? (
                  <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-200">
                    <span className="text-xs text-green-700 flex items-center">
                      <FaCheckCircle className="mr-1" />
                      {TOKENS[fromToken].symbol} 승인 완료
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <span className="text-xs text-gray-600">💭 {TOKENS[fromToken].symbol} 승인 상태 확인 중...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button 
              onClick={handleSwapTokens}
              className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors shadow-md hover:shadow-lg"
            >
              <FaArrowsAltV className="text-white text-lg" />
            </button>
          </div>

          {/* To Token */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">To</label>
              <span className="text-xs text-gray-500">
                잔액: {toTokenBalance ? parseFloat(formatUnits(toTokenBalance as bigint, TOKENS[toToken].decimals)).toFixed(4) : '0.0000'}
              </span>
            </div>
            <div className="flex space-x-2">
              <input
                type="number"
                value={amountOut}
                placeholder="0.0"
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
              <div className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg">
                <span className="font-semibold">{TOKENS[toToken].symbol}</span>
              </div>
            </div>
          </div>

          {/* Price Info */}
          {amountIn && amountOut && parseFloat(amountIn) > 0 && parseFloat(amountOut) > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 space-y-1">
                <div className="flex justify-between">
                  <span>환율:</span>
                  <span>1 {TOKENS[fromToken].symbol} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} {TOKENS[toToken].symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>수수료 (0.3%):</span>
                  <span>{(parseFloat(amountIn) * 0.003).toFixed(6)} {TOKENS[fromToken].symbol}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSwap}
            disabled={
              !amountIn || 
              !amountOut ||
              parseFloat(amountIn) <= 0 ||
              parseFloat(amountOut) <= 0 ||
              isPending || 
              isConfirming ||
              fromTokenApproval.needsApproval ||
              fromTokenApproval.isLoading
            }
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              !amountIn || 
              !amountOut ||
              parseFloat(amountIn) <= 0 ||
              parseFloat(amountOut) <= 0 ||
              isPending || 
              isConfirming ||
              fromTokenApproval.needsApproval ||
              fromTokenApproval.isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isPending || isConfirming ? '스왑 중...' : 
             fromTokenApproval.needsApproval ? '토큰 승인이 필요합니다' :
             !amountIn || parseFloat(amountIn) <= 0 ? '수량을 입력하세요' :
             !amountOut || parseFloat(amountOut) <= 0 ? '유효하지 않은 스왑' :
             '스왑하기'}
          </button>

          {/* Help Text */}
          {fromTokenApproval.needsApproval && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 flex items-start">
                <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0" />
                <span><strong>토큰 승인이란?</strong> DEX가 당신의 토큰을 사용할 수 있도록 허용하는 과정입니다.</span>
              </p>
            </div>
          )}
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">
            ✅ 스왑이 성공적으로 완료되었습니다!
          </p>
        </div>
      )}
    </div>
  )
}