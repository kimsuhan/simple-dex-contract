import { Header } from '@/components/Header'
import { Dashboard } from '@/components/Dashboard'
import { TokenSwap } from '@/components/TokenSwap'
import { LiquidityPool } from '@/components/LiquidityPool'
import { DexInfo } from '@/components/DexInfo'
import { AdminPanel } from '@/components/AdminPanel'
import { PoolList } from '@/components/PoolList'
import { PoolStats } from '@/components/PoolStats'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            SimpleDex - 탈중앙 거래소
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            MetaMask 지갑을 연결하고 토큰을 거래하며 유동성을 제공하여 수수료를 획득하세요.
            완전한 탈중앙 거래소 경험을 제공합니다.
          </p>
        </div>

        <main className="max-w-7xl mx-auto">
          {/* 상단 섹션: 통합 대시보드 */}
          <div className="mb-8">
            <Dashboard />
          </div>

          {/* 메인 섹션: DEX 기능 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TokenSwap />
            <LiquidityPool />
          </div>

          {/* 풀 정보 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PoolList />
            <PoolStats />
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
                  <p>• <strong>테스트 환경</strong> - 실제 자금 사용 금지</p>
                  <p>• <strong>Hardhat Local</strong> 네트워크 권장</p>
                  <p>• 스왑 전 토큰 승인 필요</p>
                  <p>• 개인키 절대 공유 금지</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
