'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { ERC20_ABI } from '@/lib/tokens'
import { useClientOnly } from './useClientOnly'

interface UseTokenApprovalProps {
  tokenAddress: `0x${string}`
  spenderAddress: `0x${string}`
  amount?: string
  decimals?: number
}

export function useTokenApproval({ 
  tokenAddress, 
  spenderAddress, 
  amount = '0',
  decimals = 18 
}: UseTokenApprovalProps) {
  const hasMounted = useClientOnly()
  const { address } = useAccount()
  
  // 현재 승인된 양 조회 (클라이언트에서만)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, spenderAddress] : undefined,
    query: {
      enabled: hasMounted && !!address && tokenAddress !== '0x0000000000000000000000000000000000000000',
    },
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
    onSuccess: () => {
      // 승인 완료 후 allowance 다시 조회
      console.log('Token approval transaction completed, refetching allowance...')
      refetchAllowance()
    }
  })

  // 승인이 필요한지 확인
  const needsApproval = () => {
    if (!hasMounted || !amount || parseFloat(amount) <= 0) return false
    
    // allowance가 없다면 (아직 로딩 중이거나 0이라면) 승인이 필요할 수 있음
    if (allowance === undefined) return false // 로딩 중
    
    const requiredAmount = parseUnits(amount, decimals)
    const currentAllowance = allowance as bigint
    
    console.log('Approval check:', {
      tokenAddress,
      amount,
      requiredAmount: requiredAmount.toString(),
      currentAllowance: currentAllowance.toString(),
      needsApproval: currentAllowance < requiredAmount
    })
    
    return currentAllowance < requiredAmount
  }

  // 토큰 승인 실행
  const approve = (approveAmount?: string) => {
    if (!address) {
      console.error('No address available for approval')
      return
    }

    try {
      const amountToApprove = approveAmount || amount
      const parsedAmount = amountToApprove ? parseUnits(amountToApprove, decimals) : parseUnits('1000000', decimals)

      console.log('Executing approve:', {
        tokenAddress,
        spenderAddress,
        amountToApprove,
        parsedAmount: parsedAmount.toString()
      })

      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, parsedAmount],
      })
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }

  // 무제한 승인 (일반적으로 사용되는 패턴)
  const approveMax = () => {
    if (!address) {
      console.error('No address available for max approval')
      return
    }

    try {
      // 최대값으로 승인 (2^256 - 1)
      const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      
      console.log('Executing max approve:', {
        tokenAddress,
        spenderAddress,
        maxAmount: maxAmount.toString()
      })
      
      writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, maxAmount],
      })
    } catch (error) {
      console.error('Max approval failed:', error)
    }
  }

  return {
    allowance: allowance as bigint | undefined,
    allowanceFormatted: allowance ? formatUnits(allowance as bigint, decimals) : '0',
    needsApproval: needsApproval(),
    approve,
    approveMax,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
  }
}