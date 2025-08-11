'use client';

import { useClientOnly } from '@/hooks/useClientOnly';
import { useTokenApproval } from '@/hooks/useTokenApproval';
import { SIMPLE_DEX_ABI, SIMPLE_DEX_ADDRESS } from '@/lib/dex';
import { ERC20_ABI, TOKENS, TokenInfo } from '@/lib/tokens';
import { useState, useEffect } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { FaTint, FaLock, FaCheckCircle, FaInfoCircle, FaUser } from 'react-icons/fa';
import { TokenSelector } from './TokenSelector';

export function LiquidityPool() {
  const hasMounted = useClientOnly();
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<'add' | 'remove'>('add');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [tokenA, setTokenA] = useState<TokenInfo | undefined>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<TokenInfo | undefined>(TOKENS[1]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
  });

  // isSuccess 변경을 감지하여 데이터 새로고침 (함수들이 정의된 후 실행)
  useEffect(() => {
    if (isSuccess) {
      // 유동성 추가 완료 후 모든 관련 데이터 새로고침
      console.log('Liquidity addition completed, refreshing all data...')
      // 입력 필드 초기화
      setAmountA('')
      setAmountB('')
    }
  }, [isSuccess]);

  // 토큰 A 승인 상태 (클라이언트에서만)
  const tokenAApproval = useTokenApproval({
    tokenAddress: tokenA?.address || '0x0000000000000000000000000000000000000000',
    spenderAddress: SIMPLE_DEX_ADDRESS,
    amount: hasMounted ? amountA : '',
    decimals: tokenA?.decimals || 18,
  });

  // 토큰 B 승인 상태 (클라이언트에서만)
  const tokenBApproval = useTokenApproval({
    tokenAddress: tokenB?.address || '0x0000000000000000000000000000000000000000',
    spenderAddress: SIMPLE_DEX_ADDRESS,
    amount: hasMounted ? amountB : '',
    decimals: tokenB?.decimals || 18,
  });

  // 토큰 잔액 조회 (클라이언트에서만)
  const { data: tokenABalance, refetch: refetchTokenABalance } = useReadContract({
    address: tokenA?.address || '0x0000000000000000000000000000000000000000',
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: hasMounted && !!address && !!tokenA && tokenA.address !== '0x0000000000000000000000000000000000000000',
    },
  });

  const { data: tokenBBalance, refetch: refetchTokenBBalance } = useReadContract({
    address: tokenB?.address || '0x0000000000000000000000000000000000000000',
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: hasMounted && !!address && !!tokenB && tokenB.address !== '0x0000000000000000000000000000000000000000',
    },
  });

  // 풀 정보 조회 (클라이언트에서만)
  const { data: poolData, refetch: refetchPoolData } = useReadContract({
    address: SIMPLE_DEX_ADDRESS,
    abi: SIMPLE_DEX_ABI,
    functionName: 'pools',
    args: tokenA && tokenB ? [tokenA.address, tokenB.address] : undefined,
    query: {
      enabled:
        hasMounted &&
        !!tokenA &&
        !!tokenB,
    },
  });

  // 사용자의 개인 공급량 조회 (클라이언트에서만)
  const { data: userLiquidity, refetch: refetchUserLiquidity } = useReadContract({
    address: SIMPLE_DEX_ADDRESS,
    abi: SIMPLE_DEX_ABI,
    functionName: 'getMyLiquidity',
    args: address && tokenA && tokenB ? [tokenA.address, tokenB.address] : undefined,
    query: {
      enabled: hasMounted && !!address && !!tokenA && !!tokenB,
    },
  });

  console.log(poolData);

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB || !address || !tokenA || !tokenB) return;

    try {
      const parsedAmountA = parseUnits(amountA, tokenA.decimals);
      const parsedAmountB = parseUnits(amountB, tokenB.decimals);

      writeContract({
        address: SIMPLE_DEX_ADDRESS,
        abi: SIMPLE_DEX_ABI,
        functionName: 'addLiquidity',
        args: [tokenA.address, tokenB.address, parsedAmountA, parsedAmountB],
      });
    } catch (error) {
      console.error('Add liquidity failed:', error);
    }
  };

  // SSR 안전성을 위한 로딩 상태
  if (!hasMounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
          <span className="mr-2">💧</span>
          유동성 풀
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">유동성 풀</h3>
        <p className="text-gray-500 text-center py-4">지갑을 연결하면 유동성을 관리할 수 있습니다.</p>
      </div>
    );
  }

  // SIMPLE_DEX_ADDRESS는 상수이므로 이 체크는 불필요
  if (false) { // 원래: SIMPLE_DEX_ADDRESS === '0x0000000000000000000000000000000000000000'
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">유동성 풀</h3>
        <p className="text-yellow-700 text-center py-4">SimpleDex 컨트랙트 주소를 설정해주세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center">
        <FaTint className="mr-2 text-blue-600" />
        유동성 풀
      </h3>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setTab('add')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            tab === 'add' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          유동성 추가
        </button>
        <button
          onClick={() => setTab('remove')}
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed relative"
        >
          유동성 제거
          <span className="absolute -top-1 -right-1 text-xs bg-yellow-500 text-white px-1 rounded">곧 출시</span>
        </button>
      </div>

      {/* Add Liquidity */}
      {tab === 'add' && (
        <div className="space-y-4">
          {/* Token Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">토큰 A</label>
              <TokenSelector
                tokens={TOKENS}
                selectedToken={tokenA}
                onTokenSelect={setTokenA}
                excludeTokens={tokenB ? [tokenB] : []}
                placeholder="토큰 A 선택"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">토큰 B</label>
              <TokenSelector
                tokens={TOKENS}
                selectedToken={tokenB}
                onTokenSelect={setTokenB}
                excludeTokens={tokenA ? [tokenA] : []}
                placeholder="토큰 B 선택"
              />
            </div>
          </div>

          {/* Token A Input */}
          {tokenA && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">{tokenA.symbol} 수량</label>
                <span className="text-xs text-gray-500">
                  잔액: {tokenABalance ? parseFloat(formatUnits(tokenABalance as bigint, tokenA.decimals)).toFixed(4) : '0.0000'}
                </span>
              </div>
              <input
                type="number"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                placeholder="0.0"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Token A Approval */}
              {amountA && parseFloat(amountA) > 0 && (
                <div className="mt-2">
                  {tokenAApproval.needsApproval ? (
                    <div className="flex items-center justify-between bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                      <span className="text-xs text-yellow-700 flex items-center">
                        <FaLock className="mr-1" />
                        {tokenA.symbol} 승인 필요
                      </span>
                      <button
                        onClick={() => {
                          console.log('Token A approve button clicked');
                          tokenAApproval.approveMax();
                        }}
                        disabled={tokenAApproval.isLoading}
                        className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tokenAApproval.isLoading ? '승인 중...' : '승인하기'}
                      </button>
                    </div>
                  ) : tokenAApproval.allowance !== undefined && tokenAApproval.allowance > 0n ? (
                    <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-200">
                      <span className="text-xs text-green-700 flex items-center">
                        <FaCheckCircle className="mr-1" />
                        {tokenA.symbol} 승인 완료
                      </span>
                      <span className="text-xs text-green-600">한도: {parseFloat(tokenAApproval.allowanceFormatted).toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-600">💭 {tokenA.symbol} 승인 상태 확인 중...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Token B Input */}
          {tokenB && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">{tokenB.symbol} 수량</label>
                <span className="text-xs text-gray-500">
                  잔액: {tokenBBalance ? parseFloat(formatUnits(tokenBBalance as bigint, tokenB.decimals)).toFixed(4) : '0.0000'}
                </span>
              </div>
              <input
                type="number"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                placeholder="0.0"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Token B Approval */}
              {amountB && parseFloat(amountB) > 0 && (
                <div className="mt-2">
                  {tokenBApproval.needsApproval ? (
                    <div className="flex items-center justify-between bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                      <span className="text-xs text-yellow-700 flex items-center">
                        <FaLock className="mr-1" />
                        {tokenB.symbol} 승인 필요
                      </span>
                      <button
                        onClick={() => {
                          console.log('Token B approve button clicked');
                          tokenBApproval.approveMax();
                        }}
                        disabled={tokenBApproval.isLoading}
                        className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tokenBApproval.isLoading ? '승인 중...' : '승인하기'}
                      </button>
                    </div>
                  ) : tokenBApproval.allowance !== undefined && tokenBApproval.allowance > 0n ? (
                    <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-200">
                      <span className="text-xs text-green-700 flex items-center">
                        <FaCheckCircle className="mr-1" />
                        {tokenB.symbol} 승인 완료
                      </span>
                      <span className="text-xs text-green-600">한도: {parseFloat(tokenBApproval.allowanceFormatted).toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-600">💭 {tokenB.symbol} 승인 상태 확인 중...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add Liquidity Button */}
          <button
            onClick={handleAddLiquidity}
            disabled={
              !tokenA ||
              !tokenB ||
              !amountA ||
              !amountB ||
              isPending ||
              isConfirming ||
              tokenAApproval.needsApproval ||
              tokenBApproval.needsApproval ||
              tokenAApproval.isLoading ||
              tokenBApproval.isLoading
            }
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              !tokenA ||
              !tokenB ||
              !amountA ||
              !amountB ||
              isPending ||
              isConfirming ||
              tokenAApproval.needsApproval ||
              tokenBApproval.needsApproval ||
              tokenAApproval.isLoading ||
              tokenBApproval.isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {!tokenA || !tokenB
              ? '토큰을 선택하세요'
              : isPending || isConfirming
              ? '추가 중...'
              : tokenAApproval.needsApproval || tokenBApproval.needsApproval
              ? '토큰 승인이 필요합니다'
              : '유동성 추가'}
          </button>

          {/* Help Text */}
          {(tokenAApproval.needsApproval || tokenBApproval.needsApproval) && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 flex items-start">
                <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0" />
                <span><strong>토큰 승인이란?</strong> DEX가 당신의 토큰을 사용할 수 있도록 허용하는 과정입니다. 각 토큰마다 한 번만 승인하면 되며, 이후
                거래에서는 승인이 필요하지 않습니다.</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Remove Liquidity - Coming Soon */}
      {tab === 'remove' && (
        <div className="space-y-4 opacity-50">
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🚧</div>
            <h4 className="font-semibold text-gray-700 mb-2">개발 중</h4>
            <p className="text-sm text-gray-600">유동성 제거 기능은 곧 출시됩니다!</p>
          </div>
        </div>
      )}

      {/* Pool Info */}
      {poolData && tokenA && tokenB && (
        <div className="mt-6 space-y-4">
          {/* 전체 풀 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">
              {tokenA.symbol} / {tokenB.symbol} 풀 정보
            </h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div className="flex justify-between">
                <span>총 {tokenA.symbol}:</span>
                <span>{parseFloat(formatUnits((poolData as unknown as [bigint, bigint, bigint])[0], tokenA.decimals)).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>총 {tokenB.symbol}:</span>
                <span>{parseFloat(formatUnits((poolData as unknown as [bigint, bigint, bigint])[1], tokenB.decimals)).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>전체 유동성:</span>
                <span>{parseFloat(formatUnits((poolData as unknown as [bigint, bigint, bigint])[2], 18)).toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* 사용자 개인 공급량 */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <FaUser className="mr-2" />
              내 공급량
            </h4>
            <div className="text-sm text-green-700 space-y-2">
              <div className="flex justify-between">
                <span>내가 공급한 유동성:</span>
                <span className="font-mono font-semibold">
                  {userLiquidity ? parseFloat(formatUnits(userLiquidity as bigint, 18)).toFixed(4) : '0.0000'}
                </span>
              </div>
              {userLiquidity && userLiquidity > 0n && poolData && (
                <>
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span>전체 대비 내 비율:</span>
                      <span className="font-semibold">
                        {(
                          (parseFloat(formatUnits(userLiquidity as bigint, 18)) /
                            parseFloat(formatUnits((poolData as unknown as [bigint, bigint, bigint])[2], 18))) *
                          100
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="bg-green-100 p-2 rounded border border-green-300 mt-2">
                    <p className="text-xs text-green-800 font-medium mb-1">💡 예상 회수 가능 토큰:</p>
                    <div className="text-xs text-green-700 space-y-1">
                      <div className="flex justify-between">
                        <span>{tokenA.symbol}:</span>
                        <span>
                          ~
                          {(
                            (parseFloat(formatUnits(userLiquidity as bigint, 18)) /
                              parseFloat(formatUnits((poolData as unknown as [bigint, bigint, bigint])[2], 18))) *
                            parseFloat(formatUnits((poolData as unknown as [bigint, bigint, bigint])[0], tokenA.decimals))
                          ).toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{tokenB.symbol}:</span>
                        <span>
                          ~
                          {(
                            (parseFloat(formatUnits(userLiquidity as bigint, 18)) /
                              parseFloat(formatUnits((poolData as unknown as [bigint, bigint, bigint])[2], 18))) *
                            parseFloat(formatUnits((poolData as unknown as [bigint, bigint, bigint])[1], tokenB.decimals))
                          ).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {(!userLiquidity || userLiquidity === 0n) && (
                <div className="text-center py-2">
                  <p className="text-xs text-green-600">아직 유동성을 공급하지 않았습니다.</p>
                  <p className="text-xs text-green-500 mt-1">위에서 유동성을 추가해보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm flex items-center">
            <FaCheckCircle className="mr-1" />
            유동성 추가가 성공적으로 완료되었습니다!
          </p>
        </div>
      )}
    </div>
  );
}
