'use client';

import { AdminPanel } from '@/components/AdminPanel';
import { Dashboard } from '@/components/Dashboard';
import { DexInfo } from '@/components/DexInfo';
import { Header } from '@/components/Header';
import { LiquidityPool } from '@/components/LiquidityPool';
import { PoolList } from '@/components/PoolList';
import { PoolListHorizontal } from '@/components/PoolListHorizontal';
import { PoolStats } from '@/components/PoolStats';
import { TokenSwapModal } from '@/components/TokenSwapModal';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// TokenTable을 동적 import로 SSR 방지
const TokenTable = dynamic(() => import('@/components/TokenTable').then(mod => ({ default: mod.TokenTable })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="mr-2 w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
          </svg>
          토큰 잔액
        </h3>
      </div>
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  )
});

interface PoolData {
  tokenA: string;
  tokenB: string;
  tokenAReserve: string;
  tokenBReserve: string;
  totalLiquidity: string;
}

export default function Home() {
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapPool, setSwapPool] = useState<PoolData | null>(null);

  const handlePoolSelect = (pool: PoolData) => {
    setSelectedPool(pool);
  };

  const handleSwapClick = (pool: PoolData) => {
    setSwapPool(pool);
    setSwapModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <main className="max-w-7xl mx-auto">
          {/* 상단 섹션: 통합 대시보드 */}
          <div className="mb-8">
            <Dashboard />
          </div>

          {/* 토큰 잔액 테이블 */}
          <div className="mb-8">
            <TokenTable />
          </div>

          {/* 유동성 풀 목록 - 수평 스크롤 */}
          <div className="mb-8">
            <PoolListHorizontal onPoolSelect={handlePoolSelect} selectedPool={selectedPool} onSwapClick={handleSwapClick} />
          </div>

          {/* 메인 섹션: DEX 기능 */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
            <LiquidityPool />
          </div>

          {/* 통계 및 상세 정보 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PoolStats />
            <PoolList />
          </div>

          {/* DEX 정보 섹션 */}
          <div className="mb-6">
            <DexInfo />
          </div>

          {/* 관리자 패널 - 소유자에게만 표시 */}
          <div className="mb-8">
            <AdminPanel />
          </div>

          {/* 하단 섹션: 간소화된 가이드 */}
          <div className="bg-white rounded-lg border p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-800 flex items-center">
                  <span className="mr-2">📋</span>빠른 시작 가이드
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-blue-600 min-w-[20px]">1.</span>
                    <span>MetaMask 지갑 연결</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-blue-600 min-w-[20px]">2.</span>
                    <span>토큰 승인 → 유동성 추가</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-blue-600 min-w-[20px]">3.</span>
                    <span>토큰 스왑 및 거래</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-yellow-800 flex items-center">
                  <span className="mr-2">⚠️</span>주의사항
                </h4>
                <div className="space-y-1 text-xs text-yellow-700">
                  <p>
                    • <strong>테스트 환경</strong> - 실제 자금 사용 금지
                  </p>
                  <p>
                    • <strong>Hardhat Local</strong> 네트워크 권장
                  </p>
                  <p>• 스왑 전 토큰 승인 필요</p>
                  <p>• 개인키 절대 공유 금지</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 스왑 모달 */}
      <TokenSwapModal isOpen={swapModalOpen} onClose={() => setSwapModalOpen(false)} selectedPool={swapPool} />
    </div>
  );
}
