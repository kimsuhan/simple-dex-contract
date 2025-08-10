export interface LiquidityEvent {
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
  type: 'LIQUIDITY_ADDED' | 'LIQUIDITY_REMOVED' | 'SWAP';
}
