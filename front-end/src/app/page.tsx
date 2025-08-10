import { Header } from '@/components/Header'
import { WalletInfo } from '@/components/WalletInfo'
import { TokenList } from '@/components/TokenList'
import { TokenSwap } from '@/components/TokenSwap'
import { LiquidityPool } from '@/components/LiquidityPool'
import { DexInfo } from '@/components/DexInfo'
import { AdminPanel } from '@/components/AdminPanel'

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
          {/* 첫 번째 섹션: 지갑 정보 및 토큰 잔액 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <WalletInfo />
            <TokenList />
          </div>

          {/* 두 번째 섹션: DEX 기능 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <TokenSwap />
            <LiquidityPool />
            <DexInfo />
          </div>

          {/* 관리자 패널 - 소유자에게만 표시 */}
          <div className="mb-12">
            <AdminPanel />
          </div>

          {/* 세 번째 섹션: 사용 방법 및 주의사항 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <span className="mr-2">📋</span>
                SimpleDex 사용 방법
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>상단 헤더에서 MetaMask 지갑을 연결하세요.</li>
                <li>토큰 잔액을 확인하고 필요시 테스트 토큰을 받으세요.</li>
                <li><strong>유동성 추가</strong>: 두 토큰을 동시에 예치하여 수수료를 획득하세요.</li>
                <li><strong>토큰 스왑</strong>: 한 토큰을 다른 토큰으로 즉시 교환하세요.</li>
                <li><strong>유동성 제거</strong>: 언제든지 예치한 토큰을 회수할 수 있습니다.</li>
                <li>실시간 환율 및 풀 정보를 확인하세요.</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <span className="mr-2">⚠️</span>
                주의사항
              </h4>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• <strong>테스트 환경</strong>이므로 실제 자금을 사용하지 마세요</li>
                <li>• <strong>Hardhat Local 네트워크</strong> (chainId: 31337) 사용 권장</li>
                <li>• <strong>개인키/시드 문구</strong>를 절대 공유하지 마세요</li>
                <li>• 컨트랙트 배포 후 주소를 반드시 업데이트하세요</li>
                <li>• 스왑 전에 토큰 승인(approve) 트랜잭션이 필요할 수 있습니다</li>
                <li>• 유동성이 부족하면 큰 가격 변동이 발생할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
