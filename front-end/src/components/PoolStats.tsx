'use client'

import { useState, useEffect } from 'react'
import { useClientOnly } from '@/hooks/useClientOnly'
import { 
  FaChartBar,
  FaSpinner,
  FaExclamationCircle,
  FaChartLine,
  FaTint,
  FaExchangeAlt,
  FaClock,
  FaDatabase
} from 'react-icons/fa'

interface PoolStats {
  totalPools: number
  recentSwaps24h: number
  recentLiquidity24h: number
  lastUpdate: string
}

export function PoolStats() {
  const hasMounted = useClientOnly()
  const [stats, setStats] = useState<PoolStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/pools/stats')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as PoolStats
      setStats(data)
    } catch (err) {
      console.error('Stats 데이터 가져오기 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasMounted) {
      fetchStats()
      
      // 1분마다 자동 새로고침
      const interval = setInterval(() => {
        fetchStats()
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [hasMounted])

  if (!hasMounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
          <FaChartBar className="mr-2 text-blue-600" />
          DEX 통계
        </h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaChartBar className="mr-2 text-blue-600" />
          DEX 통계
        </h3>
        
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? <FaSpinner className="animate-spin mr-1" /> : <FaDatabase className="mr-1" />}
          새로고침
        </button>
      </div>

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
      {loading && !stats && (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">통계를 가져오는 중...</p>
        </div>
      )}

      {/* 통계 정보 */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 총 풀 개수 */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600">총 풀 개수</span>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <FaChartLine className="text-white text-lg" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">{stats.totalPools}</div>
              <div className="text-xs text-blue-600">활성 유동성 풀</div>
            </div>
            
            {/* 24시간 유동성 활동 */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-600">24시간 유동성</span>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <FaTint className="text-white text-lg" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-900 mb-1">{stats.recentLiquidity24h}</div>
              <div className="text-xs text-green-600">추가/제거 트랜잭션</div>
            </div>
            
            {/* 24시간 스왑 활동 */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-purple-600">24시간 스왑</span>
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <FaExchangeAlt className="text-white text-lg" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-900 mb-1">{stats.recentSwaps24h}</div>
              <div className="text-xs text-purple-600">토큰 교환 트랜잭션</div>
            </div>
          </div>

          {/* 활동 요약 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaChartBar className="mr-2 text-gray-600" />
              24시간 활동 요약
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">총 트랜잭션:</span>
                  <span className="font-semibold text-gray-800">
                    {stats.recentLiquidity24h + stats.recentSwaps24h}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">평균 풀당 활동:</span>
                  <span className="font-semibold text-gray-800">
                    {stats.totalPools > 0 
                      ? ((stats.recentLiquidity24h + stats.recentSwaps24h) / stats.totalPools).toFixed(1)
                      : '0'
                    }
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">유동성 비율:</span>
                  <span className="font-semibold text-green-700">
                    {stats.recentLiquidity24h + stats.recentSwaps24h > 0
                      ? Math.round((stats.recentLiquidity24h / (stats.recentLiquidity24h + stats.recentSwaps24h)) * 100)
                      : 0
                    }%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">스왑 비율:</span>
                  <span className="font-semibold text-purple-700">
                    {stats.recentLiquidity24h + stats.recentSwaps24h > 0
                      ? Math.round((stats.recentSwaps24h / (stats.recentLiquidity24h + stats.recentSwaps24h)) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 마지막 업데이트 시간 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <FaClock className="mr-1" />
              <span>마지막 업데이트: {new Date(stats.lastUpdate).toLocaleString('ko-KR')}</span>
            </div>
          </div>
        </>
      )}

      {/* 데이터가 없을 때 */}
      {!loading && !error && !stats && (
        <div className="text-center py-8">
          <FaChartBar className="text-4xl text-gray-400 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-700 mb-2">통계 데이터 없음</h4>
          <p className="text-sm text-gray-500">
            아직 수집된 통계 데이터가 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}