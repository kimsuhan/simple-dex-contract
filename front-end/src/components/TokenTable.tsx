'use client';

import { ERC20_ABI, TOKENS, TokenInfo } from '@/lib/tokens';
import { useMemo, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContracts, useWriteContract } from 'wagmi';
import { useClientOnly } from '@/hooks/useClientOnly';
import { 
  FaCoins, 
  FaSpinner, 
  FaPaperPlane,
  FaWallet,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

interface TokenTableProps {
  className?: string;
}

export function TokenTable({ className = '' }: TokenTableProps) {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const hasMounted = useClientOnly();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollLeft = () => {
    const container = document.getElementById('token-scroll-container');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('token-scroll-container');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // 모든 토큰의 잔액을 동시에 조회
  const contracts = useMemo(
    () =>
      TOKENS.map((token) => ({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      })),
    [address],
  );

  const { data: balances, isLoading: balancesLoading } = useReadContracts({
    contracts,
    query: { enabled: !!address && isConnected },
  });

  const handleSendClick = (token: TokenInfo) => {
    setSelectedToken(token);
    setSendModalOpen(true);
    setRecipient('');
    setAmount('');
  };

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToken || !recipient || !amount) return;

    setIsLoading(true);
    try {
      const amountWei = parseUnits(amount, selectedToken.decimals);

      await writeContract({
        address: selectedToken.address,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, amountWei],
      });

      // 성공 시 모달 닫기
      setSendModalOpen(false);
      setSelectedToken(null);
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('토큰 전송 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 클라이언트에서만 렌더링
  if (!hasMounted) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaWallet className="mr-2 text-blue-600" />
            토큰 잔액
          </h3>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={true}
            >
              <FaChevronLeft className="text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={true}
            >
              <FaChevronRight className="text-gray-400" />
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaWallet className="mr-2 text-blue-600" />
            토큰 잔액
          </h3>
        </div>
        <div className="text-center py-8">
          <FaWallet className="text-3xl text-gray-400 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-700 mb-2">지갑 연결이 필요합니다</h4>
          <p className="text-sm text-gray-500">토큰 잔액을 확인하려면 지갑을 연결해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg border shadow-sm p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaCoins className="mr-2 text-blue-600" />
            토큰 잔액 ({TOKENS.length}개)
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={scrollLeft}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={TOKENS.length <= 3}
            >
              <FaChevronLeft className="text-gray-400" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={TOKENS.length <= 3}
            >
              <FaChevronRight className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {balancesLoading && (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-xl text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">토큰 잔액을 가져오는 중...</p>
          </div>
        )}

        {/* 토큰 목록 - 수평 스크롤 카드 */}
        {!balancesLoading && (
          <div 
            id="token-scroll-container"
            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TOKENS.map((token, index) => {
              const balance = balances?.[index]?.result as bigint | undefined;
              const formattedBalance = balance ? formatUnits(balance, token.decimals) : '0';

              return (
                <div
                  key={token.address}
                  className="min-w-[200px] border rounded-lg p-4 hover:shadow-md transition-all border-gray-200 hover:border-gray-300"
                >
                  {/* 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full ${token.color || 'bg-gray-400'} flex items-center justify-center text-white text-sm font-medium`}>
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {token.symbol}
                        </h4>
                        <div className="text-xs text-gray-500">{token.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* 잔액 정보 */}
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <div className="text-xs text-gray-600 font-medium mb-1">
                      잔액
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {Number(formattedBalance).toFixed(4)} {token.symbol}
                    </div>
                  </div>

                  {/* 전송 버튼 */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleSendClick(token)}
                      disabled={!balance || balance === 0n}
                      className="w-full py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                    >
                      <FaPaperPlane />
                      <span>전송</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 토큰 전송 모달 */}
      {sendModalOpen && selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedToken.symbol} 전송</h3>
              <button onClick={() => setSendModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSendSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">받는 주소</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전송량</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSendModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '전송 중...' : '전송'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}