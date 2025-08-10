'use client';

import { useClientOnly } from '@/hooks/useClientOnly';
import { FaChartBar, FaCheckCircle, FaClock, FaTools, FaWallet } from 'react-icons/fa';
import { RiTokenSwapLine } from 'react-icons/ri';
import { SiEthereum } from 'react-icons/si';
import { formatEther } from 'viem';
import { useAccount, useBalance, useChainId } from 'wagmi';

export function Dashboard() {
  const hasMounted = useClientOnly();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const { data: ethBalance } = useBalance({
    address,
    query: {
      enabled: hasMounted && !!address,
      refetchInterval: 5000,
    },
  });

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Mainnet';
      case 11155111:
        return 'Sepolia';
      case 31337:
        return 'Local';
      default:
        return `Chain ${chainId}`;
    }
  };

  if (!hasMounted) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-8">
          <FaWallet className="text-4xl mb-4 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">지갑 연결이 필요합니다</h3>
          <p className="text-sm text-gray-500">상단 헤더에서 MetaMask를 연결하여 SimpleDex를 시작하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaChartBar className="mr-2 text-blue-600" />내 대시보드
        </h2>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full font-medium">{getChainName(chainId)}</span>
          <span className="text-xs text-gray-500 font-mono">{`${address!.slice(0, 6)}...${address!.slice(-4)}`}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {/* ETH 잔액 */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-600">ETH</span>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <SiEthereum className="text-white text-sm" />
            </div>
          </div>
          <div className="text-sm font-semibold text-blue-900">
            {ethBalance ? `${parseFloat(formatEther(ethBalance.value)).toFixed(4)}` : '0.0000'}
          </div>
          <div className="text-xs text-blue-600">이더리움</div>
        </div>

        {/* SimpleDex 상태 */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-orange-600">DEX</span>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <RiTokenSwapLine className="text-white text-lg" />
            </div>
          </div>
          <div className="text-sm font-semibold text-orange-900">0.3% 수수료</div>
          <div className="text-xs text-orange-600">스왑 & 유동성</div>
        </div>
      </div>

      {/* 하단 추가 정보 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-1" />
              유동성 추가
            </span>
            <span className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-1" />
              토큰 스왑
            </span>
            <span className="flex items-center">
              <FaTools className="text-yellow-500 mr-1" />
              유동성 제거
            </span>
          </div>
          <div className="text-right flex items-center">
            <FaClock className="mr-1" />
            <span>마지막 업데이트: 방금 전</span>
          </div>
        </div>
      </div>
    </div>
  );
}
