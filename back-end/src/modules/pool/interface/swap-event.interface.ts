export interface SwapEvent {
  id: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  user: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
}
