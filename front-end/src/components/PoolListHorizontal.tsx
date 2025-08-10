'use client'

import { useState, useEffect } from 'react'
import { useClientOnly } from '@/hooks/useClientOnly'
import { formatUnits } from 'viem'
import { TOKENS } from '@/lib/tokens'
import { 
  FaTint, 
  FaSpinner, 
  FaExclamationCircle,
  FaCoins,
  FaExchangeAlt,
  FaInfoCircle,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import { RiCoinLine } from 'react-icons/ri'

interface PoolData {
  tokenA: string
  tokenB: string
  tokenAReserve: string
  tokenBReserve: string
  totalLiquidity: string
}

interface PoolListHorizontalProps {
  onPoolSelect?: (pool: PoolData) => void
  selectedPool?: PoolData | null
  onSwapClick?: (pool: PoolData) => void
}

export function PoolListHorizontal({ onPoolSelect, selectedPool, onSwapClick }: PoolListHorizontalProps) {
  const hasMounted = useClientOnly()
  const [pools, setPools] = useState<PoolData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPools = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/pools')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.text()
      
      if (!data) {
        setPools([])
        return
      }

      const poolData = JSON.parse(data) as PoolData[]
      setPools(Array.isArray(poolData) ? poolData : [])
    } catch (err) {
      console.error('Pool 데이터 가져오기 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasMounted) {
      fetchPools()
      
      // 30초마다 자동 새로고침
      const interval = setInterval(() => {
        fetchPools()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [hasMounted])

  const getTokenSymbol = (address: string) => {
    const token = TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase())
    return token?.symbol || `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatReserve = (reserve: string, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(reserve), decimals)).toFixed(2)
  }

  const scrollLeft = () => {
    const container = document.getElementById('pool-scroll-container')
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById('pool-scroll-container')
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  if (!hasMounted) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaTint className="mr-2 text-blue-600" />
            유동성 풀
          </h3>
        </div>
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaTint className="mr-2 text-blue-600" />
          유동성 풀 {pools.length > 0 && `(${pools.length}개)`}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={pools.length <= 3}
          >
            <FaChevronLeft className="text-gray-400" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={pools.length <= 3}
          >
            <FaChevronRight className="text-gray-400" />
          </button>
          <button
            onClick={fetchPools}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaExchangeAlt />}
          </button>
        </div>
      </div>

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && pools.length === 0 && (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-xl text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">풀 데이터를 가져오는 중...</p>
        </div>
      )}

      {/* 풀 목록 - 수평 스크롤 */}
      {!loading && !error && (
        <>
          {pools.length === 0 ? (
            <div className="text-center py-8">
              <FaInfoCircle className="text-3xl text-gray-400 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700 mb-2">풀이 없습니다</h4>
              <p className="text-sm text-gray-500">
                첫 번째 유동성 풀을 만들어보세요!
              </p>
            </div>
          ) : (
            <div 
              id="pool-scroll-container"
              className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {pools.map((pool, index) => (
                <div
                  key={`${pool.tokenA}-${pool.tokenB}-${index}`}
                  onClick={() => onPoolSelect?.(pool)}
                  className={`min-w-[280px] border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedPool && 
                    selectedPool.tokenA === pool.tokenA && 
                    selectedPool.tokenB === pool.tokenB
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border border-white">
                          <RiCoinLine className="text-white text-xs" />
                        </div>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border border-white">
                          <FaCoins className="text-white text-xs" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {getTokenSymbol(pool.tokenA)} / {getTokenSymbol(pool.tokenB)}
                        </h4>
                      </div>
                    </div>
                    
                    {selectedPool && 
                     selectedPool.tokenA === pool.tokenA && 
                     selectedPool.tokenB === pool.tokenB && (
                      <div className="text-blue-500">
                        <FaArrowRight className="text-sm" />
                      </div>
                    )}
                  </div>

                  {/* 보유량 정보 */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-purple-50 rounded p-2">
                      <div className="text-xs text-purple-600 font-medium mb-1">
                        {getTokenSymbol(pool.tokenA)}
                      </div>
                      <div className="text-sm font-semibold text-purple-900">
                        {formatReserve(pool.tokenAReserve)}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-xs text-green-600 font-medium mb-1">
                        {getTokenSymbol(pool.tokenB)}
                      </div>
                      <div className="text-sm font-semibold text-green-900">
                        {formatReserve(pool.tokenBReserve)}
                      </div>
                    </div>
                  </div>

                  {/* 총 유동성 및 액션 버튼 */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-center mb-2">
                      <div className="text-xs text-gray-500 mb-1">총 유동성</div>
                      <div className="text-sm font-semibold text-gray-800">
                        {formatReserve(pool.totalLiquidity)}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSwapClick?.(pool)
                      }}
                      className="w-full py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <FaExchangeAlt />
                      <span>스왑</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 선택된 풀이 있을 때 안내 */}
      {selectedPool && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center">
            <FaInfoCircle className="mr-2" />
            <span>
              <strong>{getTokenSymbol(selectedPool.tokenA)} / {getTokenSymbol(selectedPool.tokenB)}</strong> 풀이 선택되었습니다. 
              아래에서 스왑하거나 유동성을 관리하세요.
            </span>
          </p>
        </div>
      )}
    </div>
  )
}