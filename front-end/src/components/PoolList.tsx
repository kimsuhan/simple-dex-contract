'use client'

import { useState, useEffect } from 'react'
import { useClientOnly } from '@/hooks/useClientOnly'
import { formatUnits } from 'viem'
import { TOKENS } from '@/lib/tokens'
import { 
  FaTint, 
  FaSpinner, 
  FaExclamationCircle,
  FaChartLine,
  FaCoins,
  FaExchangeAlt,
  FaInfoCircle,
  FaEye,
  FaTimes
} from 'react-icons/fa'
import { RiCoinLine } from 'react-icons/ri'
import { PoolEvents } from './PoolEvents'

interface PoolData {
  tokenA: string
  tokenB: string
  tokenAReserve: string
  tokenBReserve: string
  totalLiquidity: string
}

interface PoolStats {
  totalPools: number
  recentSwaps24h: number
  recentLiquidity24h: number
  lastUpdate: string
}

export function PoolList() {
  const hasMounted = useClientOnly()
  const [pools, setPools] = useState<PoolData[]>([])
  const [stats, setStats] = useState<PoolStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPool, setSelectedPool] = useState<{tokenA: string, tokenB: string} | null>(null)

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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pools/stats')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const statsData = await response.json() as PoolStats
      setStats(statsData)
    } catch (err) {
      console.error('Stats 데이터 가져오기 실패:', err)
    }
  }

  useEffect(() => {
    if (hasMounted) {
      fetchPools()
      fetchStats()
      
      // 30초마다 자동 새로고침
      const interval = setInterval(() => {
        fetchPools()
        fetchStats()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [hasMounted])

  const getTokenSymbol = (address: string) => {
    const token = TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase())
    return token?.symbol || `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatReserve = (reserve: string, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(reserve), decimals)).toFixed(4)
  }

  if (!hasMounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
          <FaTint className="mr-2 text-blue-600" />
          유동성 풀 목록
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // 선택된 풀의 이벤트를 보여주는 모달
  if (selectedPool) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaTint className="mr-2 text-blue-600" />
            풀 상세 정보
          </h3>
          <button
            onClick={() => setSelectedPool(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>
        
        <PoolEvents 
          tokenA={selectedPool.tokenA} 
          tokenB={selectedPool.tokenB} 
        />
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaTint className="mr-2 text-blue-600" />
          유동성 풀 목록
        </h3>
        <button
          onClick={() => {
            fetchPools()
            fetchStats()
          }}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? <FaSpinner className="animate-spin mr-1" /> : <FaExchangeAlt className="mr-1" />}
          새로고침
        </button>
      </div>

      {/* 통계 정보 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600">총 풀 개수</span>
              <FaChartLine className="text-blue-500" />
            </div>
            <div className="text-lg font-semibold text-blue-900">{stats.totalPools}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-green-600">24시간 유동성</span>
              <FaTint className="text-green-500" />
            </div>
            <div className="text-lg font-semibold text-green-900">{stats.recentLiquidity24h}</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-purple-600">24시간 스왑</span>
              <FaExchangeAlt className="text-purple-500" />
            </div>
            <div className="text-lg font-semibold text-purple-900">{stats.recentSwaps24h}</div>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && !error && (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">풀 데이터를 가져오는 중...</p>
        </div>
      )}

      {/* 풀 목록 */}
      {!loading && !error && (
        <>
          {pools.length === 0 ? (
            <div className="text-center py-8">
              <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-700 mb-2">풀이 없습니다</h4>
              <p className="text-sm text-gray-500">
                아직 생성된 유동성 풀이 없습니다. 첫 번째 풀을 만들어보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pools.map((pool, index) => (
                <div 
                  key={`${pool.tokenA}-${pool.tokenB}-${index}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                          <RiCoinLine className="text-white text-sm" />
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                          <FaCoins className="text-white text-xs" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {getTokenSymbol(pool.tokenA)} / {getTokenSymbol(pool.tokenB)}
                        </h4>
                        <p className="text-xs text-gray-500">유동성 풀</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">
                        {formatReserve(pool.totalLiquidity)}
                      </div>
                      <div className="text-xs text-gray-500">TVL</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs text-purple-600 font-medium mb-1">
                        {getTokenSymbol(pool.tokenA)} 보유량
                      </div>
                      <div className="text-sm font-semibold text-purple-900">
                        {formatReserve(pool.tokenAReserve)}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 font-medium mb-1">
                        {getTokenSymbol(pool.tokenB)} 보유량
                      </div>
                      <div className="text-sm font-semibold text-green-900">
                        {formatReserve(pool.tokenBReserve)}
                      </div>
                    </div>
                  </div>

                  {/* 환율 정보 및 액션 버튼 */}
                  {pool.tokenAReserve !== '0' && pool.tokenBReserve !== '0' && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>
                          1 {getTokenSymbol(pool.tokenA)} = {' '}
                          {(
                            parseFloat(formatUnits(BigInt(pool.tokenBReserve), 18)) /
                            parseFloat(formatUnits(BigInt(pool.tokenAReserve), 18))
                          ).toFixed(6)} {getTokenSymbol(pool.tokenB)}
                        </span>
                        
                        <button
                          onClick={() => setSelectedPool({tokenA: pool.tokenA, tokenB: pool.tokenB})}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                        >
                          <FaEye />
                          <span>이벤트</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 마지막 업데이트 시간 */}
      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            마지막 업데이트: {new Date(stats.lastUpdate).toLocaleString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  )
}