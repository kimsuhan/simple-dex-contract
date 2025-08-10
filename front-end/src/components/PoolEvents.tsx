'use client';

import { useClientOnly } from '@/hooks/useClientOnly';
import { TOKENS } from '@/lib/tokens';
import { useEffect, useState } from 'react';
import { FaClock, FaExclamationCircle, FaExternalLinkAlt, FaFilter, FaHistory, FaSpinner, FaTint, FaUser } from 'react-icons/fa';
import { RiCoinLine } from 'react-icons/ri';
import { formatUnits } from 'viem';

interface LiquidityEvent {
  id: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  provider: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  liquidity: string;
  type: 'LIQUIDITY_ADDED' | 'LIQUIDITY_REMOVED';
}

interface PoolEventsProps {
  tokenA: string;
  tokenB: string;
}

export function PoolEvents({ tokenA, tokenB }: PoolEventsProps) {
  const hasMounted = useClientOnly();
  const [events, setEvents] = useState<LiquidityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'liquidity' | 'swap'>('all');
  const [limit, setLimit] = useState(20);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      params.append('limit', limit.toString());
      params.append('offset', '0');

      const response = await fetch(`/api/pools/${tokenA}/${tokenB}/events?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('이벤트 데이터 가져오기 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMounted && tokenA && tokenB) {
      fetchEvents();
    }
  }, [hasMounted, tokenA, tokenB, filter, limit, fetchEvents]);

  const getTokenSymbol = (address: string) => {
    const token = TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase());
    return token?.symbol || `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(amount), decimals)).toFixed(4);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExplorerUrl = (txHash: string) => {
    // 로컬 네트워크는 탐색기가 없으므로 해시만 표시
    if (!txHash) return '';
    return `#${txHash.slice(0, 10)}...`;
  };

  if (!hasMounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
          <FaHistory className="mr-2 text-blue-600" />
          이벤트 기록
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaHistory className="mr-2 text-blue-600" />
          이벤트 기록
        </h3>

        <div className="flex items-center space-x-3">
          {/* 필터 */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'liquidity' | 'swap')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="liquidity">유동성</option>
            <option value="swap">스왑</option>
          </select>

          {/* 개수 선택 */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={50}>50개</option>
          </select>

          {/* 새로고침 */}
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaFilter />}
          </button>
        </div>
      </div>

      {/* 토큰 쌍 정보 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <RiCoinLine className="text-white text-xs" />
            </div>
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <RiCoinLine className="text-white text-xs" />
            </div>
          </div>
          <span className="font-semibold text-gray-800">
            {getTokenSymbol(tokenA)} / {getTokenSymbol(tokenB)} 풀
          </span>
        </div>
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
      {loading && (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">이벤트를 가져오는 중...</p>
        </div>
      )}

      {/* 이벤트 목록 */}
      {!loading && !error && (
        <>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-700 mb-2">이벤트가 없습니다</h4>
              <p className="text-sm text-gray-500">아직 이 풀에서 발생한 이벤트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${event.type === 'LIQUIDITY_ADDED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-semibold text-sm">{event.type === 'LIQUIDITY_ADDED' ? '유동성 추가' : '유동성 제거'}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <FaClock className="text-gray-400" />
                      <span>{formatTimestamp(event.timestamp)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="bg-purple-50 rounded p-2">
                      <div className="text-xs text-purple-600 font-medium mb-1">{getTokenSymbol(event.tokenA)}</div>
                      <div className="text-sm font-semibold text-purple-900">{formatAmount(event.amountA)}</div>
                    </div>

                    <div className="bg-green-50 rounded p-2">
                      <div className="text-xs text-green-600 font-medium mb-1">{getTokenSymbol(event.tokenB)}</div>
                      <div className="text-sm font-semibold text-green-900">{formatAmount(event.amountB)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <FaUser className="text-gray-400" />
                        <span className="font-mono">{`${event.provider.slice(0, 6)}...${event.provider.slice(-4)}`}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <FaTint className="text-blue-400" />
                        <span>LP: {formatAmount(event.liquidity)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <FaExternalLinkAlt className="text-gray-400" />
                      <span className="font-mono hover:text-blue-500 cursor-pointer">{getExplorerUrl(event.transactionHash)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 하단 정보 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">최근 {events.length}개의 이벤트 • 실시간 업데이트</p>
      </div>
    </div>
  );
}
