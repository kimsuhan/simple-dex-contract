'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SIMPLE_DEX_ABI, SIMPLE_DEX_ADDRESS } from '@/lib/dex'
import { TOKENS } from '@/lib/tokens'
import { useClientOnly } from '@/hooks/useClientOnly'
import { FaTrashAlt, FaExclamationTriangle, FaChevronDown } from 'react-icons/fa'
import { MdAdminPanelSettings } from 'react-icons/md'

export function AdminPanel() {
  const hasMounted = useClientOnly()
  const { address, isConnected } = useAccount()
  const [isExpanded, setIsExpanded] = useState(false)

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
    onSuccess: () => {
      console.log('Pool reset completed successfully')
      // 페이지 전체를 새로고침하여 모든 컴포넌트의 데이터 업데이트
      setTimeout(() => {
        window.location.reload()
      }, 1500) // 성공 메시지를 1.5초 보여준 후 새로고침
    }
  })

  // 컨트랙트 소유자 조회
  const { data: owner } = useReadContract({
    address: SIMPLE_DEX_ADDRESS,
    abi: SIMPLE_DEX_ABI,
    functionName: 'owner',
    query: {
      enabled: hasMounted && SIMPLE_DEX_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  })

  const handleResetPool = async () => {
    if (!address) return

    const confirmReset = window.confirm(
      '⚠️ 정말로 풀을 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 유동성이 제거됩니다.'
    )
    
    if (!confirmReset) return

    try {
      writeContract({
        address: SIMPLE_DEX_ADDRESS,
        abi: SIMPLE_DEX_ABI,
        functionName: 'resetPool',
        args: [TOKENS[0].address, TOKENS[1].address],
      })
    } catch (error) {
      console.error('Reset pool failed:', error)
    }
  }

  // SSR 안전성을 위한 로딩 상태
  if (!hasMounted) {
    return null
  }

  if (!isConnected) {
    return null
  }

  if (SIMPLE_DEX_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return null
  }

  // 현재 사용자가 컨트랙트 소유자인지 확인
  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase()

  if (!isOwner) {
    return null
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MdAdminPanelSettings className="text-red-600 text-lg" />
          <h4 className="font-semibold text-red-800">관리자 패널</h4>
          <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
            Owner Only
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-600 hover:text-red-700 focus:outline-none"
        >
          <FaChevronDown 
            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
              <FaTrashAlt className="mr-2 text-red-500" />
              풀 초기화
            </h5>
            <p className="text-sm text-gray-600 mb-4">
              현재 {TOKENS[0].symbol}/{TOKENS[1].symbol} 풀의 모든 유동성을 제거합니다.
              <br />
              <strong className="text-red-600 flex items-center">
                <FaExclamationTriangle className="mr-1" />
                주의: 이 작업은 되돌릴 수 없습니다!
              </strong>
            </p>
            
            <button
              onClick={handleResetPool}
              disabled={isPending || isConfirming}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                isPending || isConfirming
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isPending || isConfirming ? '초기화 중...' : '풀 초기화'}
            </button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>💡 참고:</strong> 이 패널은 컨트랙트 소유자에게만 표시됩니다.
              <br />
              현재 소유자: <code className="bg-blue-100 px-1 rounded text-xs">
                {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : 'Loading...'}
              </code>
            </p>
          </div>

          {isSuccess && (
            <div className="bg-green-100 border border-green-200 p-3 rounded-lg">
              <p className="text-green-700 text-sm">
                ✅ 풀 초기화가 성공적으로 완료되었습니다!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}