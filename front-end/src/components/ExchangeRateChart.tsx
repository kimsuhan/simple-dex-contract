'use client';

import { useClientOnly } from '@/hooks/useClientOnly';
import { TOKENS } from '@/lib/tokens';
import { useEffect, useState } from 'react';
import { FaSpinner, FaExchangeAlt, FaClock, FaFilter, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ExchangeRateData {
  timestamp: number;
  aToBRate: string;
  bToARate: string;
}

interface ExchangeRateChartProps {
  tokenA: string;
  tokenB: string;
  onClose: () => void;
}

export function ExchangeRateChart({ tokenA, tokenB, onClose }: ExchangeRateChartProps) {
  const hasMounted = useClientOnly();
  const [data, setData] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [direction, setDirection] = useState<'AtoB' | 'BtoA'>('BtoA'); // BtoA = tokenB per tokenA

  const getTokenSymbol = (address: string) => {
    const token = TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase());
    return token?.symbol || `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchExchangeRateData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 백엔드 API 사용 (프론트엔드에서 프록시됨)
      const response = await fetch(`/api/pools/${tokenA}/${tokenB}/exchange-rate`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const rateData = Array.isArray(result) ? result : [];
      
      // 시간 필터링 적용
      const now = Math.floor(Date.now() / 1000);
      let timeLimit = now;
      
      switch (timeframe) {
        case '1h':
          timeLimit = now - (60 * 60);
          break;
        case '24h':
          timeLimit = now - (24 * 60 * 60);
          break;
        case '7d':
          timeLimit = now - (7 * 24 * 60 * 60);
          break;
        case '30d':
          timeLimit = now - (30 * 24 * 60 * 60);
          break;
        default:
          timeLimit = now - (24 * 60 * 60);
      }

      const filteredData = rateData
        .filter((item: ExchangeRateData) => item.timestamp >= timeLimit)
        .sort((a, b) => a.timestamp - b.timestamp) // 시간순 오름차순 정렬 (오래된 것 → 최신)
        .slice(-100); // 최대 100개까지 (최신 데이터 기준)

      setData(filteredData);
    } catch (err) {
      console.error('환율 데이터 가져오기 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMounted && tokenA && tokenB) {
      fetchExchangeRateData();
    }
  }, [hasMounted, tokenA, tokenB, timeframe]);

  // 현재 방향에 따른 토큰 정보
  const baseToken = direction === 'AtoB' ? getTokenSymbol(tokenA) : getTokenSymbol(tokenB);
  const quoteToken = direction === 'AtoB' ? getTokenSymbol(tokenB) : getTokenSymbol(tokenA);
  
  // 차트 데이터 준비
  const chartData = {
    labels: data.map(d => new Date(d.timestamp * 1000)),
    datasets: [
      {
        label: `${quoteToken} per ${baseToken}`,
        data: data.map(d => parseFloat(direction === 'AtoB' ? d.aToBRate : d.bToARate)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: data.length > 50 ? 0 : 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${baseToken}/${quoteToken} 환율 차트`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const rate = context.parsed.y;
            return `환율: ${rate.toFixed(6)} ${quoteToken}/${baseToken}`;
          },
          afterLabel: (context: any) => {
            const timestamp = context.parsed.x;
            return `시간: ${new Date(timestamp).toLocaleString('ko-KR')}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            hour: 'HH:mm',
            day: 'MM/dd',
          },
        },
        title: {
          display: true,
          text: '시간',
        },
      },
      y: {
        title: {
          display: true,
          text: `환율 (${quoteToken}/${baseToken})`,
        },
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  // 통계 계산 (데이터가 이미 시간순 정렬되어 있음)
  const rates = data.map(d => parseFloat(direction === 'AtoB' ? d.aToBRate : d.bToARate));
  const currentRate = rates.length > 0 ? rates[rates.length - 1] : 0; // 가장 최신 데이터 (마지막)
  const firstRate = rates.length > 0 ? rates[0] : 0; // 가장 오래된 데이터 (첫 번째)
  const change = currentRate - firstRate;
  const changePercent = firstRate > 0 ? (change / firstRate) * 100 : 0;
  const minRate = rates.length > 0 ? Math.min(...rates) : 0;
  const maxRate = rates.length > 0 ? Math.max(...rates) : 0;

  if (!hasMounted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaExchangeAlt className="mr-2 text-blue-600" />
            {baseToken}/{quoteToken} 환율 차트
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* 컨트롤 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* 환율 방향 선택 */}
            <div className="flex items-center space-x-2">
              <FaExchangeAlt className="text-gray-500" />
              <button
                onClick={() => setDirection(direction === 'AtoB' ? 'BtoA' : 'AtoB')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1"
              >
                <span>{baseToken}</span>
                <span>/</span>
                <span>{quoteToken}</span>
              </button>
            </div>

            {/* 시간대 선택 */}
            <div className="flex items-center space-x-2">
              <FaClock className="text-gray-500" />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">1시간</option>
                <option value="24h">24시간</option>
                <option value="7d">7일</option>
                <option value="30d">30일</option>
              </select>
            </div>

            {/* 새로고침 */}
            <button
              onClick={fetchExchangeRateData}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaFilter />}
            </button>
          </div>

          {/* 현재 통계 */}
          {data.length > 0 && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-gray-600">
                현재: <span className="font-semibold">{currentRate.toFixed(6)}</span>
              </div>
              <div className={`flex items-center ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {changePercent >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                <span className="font-semibold">{changePercent.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* 에러 상태 */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">환율 데이터를 가져오는 중...</p>
          </div>
        )}

        {/* 차트 */}
        {!loading && !error && (
          <>
            {data.length === 0 ? (
              <div className="text-center py-12">
                <FaExchangeAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-700 mb-2">환율 데이터가 없습니다</h3>
                <p className="text-sm text-gray-500">
                  아직 이 풀에서 발생한 거래가 없어 환율 히스토리를 표시할 수 없습니다.
                </p>
              </div>
            ) : (
              <>
                {/* 차트 컨테이너 */}
                <div className="h-80 mb-6">
                  <Line data={chartData} options={chartOptions} />
                </div>

                {/* 통계 요약 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">현재 환율</div>
                    <div className="font-semibold text-gray-800">{currentRate.toFixed(6)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">변화율</div>
                    <div className={`font-semibold ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">최고가</div>
                    <div className="font-semibold text-gray-800">{maxRate.toFixed(6)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">최저가</div>
                    <div className="font-semibold text-gray-800">{minRate.toFixed(6)}</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}