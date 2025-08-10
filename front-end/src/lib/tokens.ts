export interface TokenInfo {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  color?: string; // UI에서 토큰별 색상 구분용
}

// 배포된 토큰 목록 (ignition/deployments/chain-31337/deployed_addresses.json 기준)
export const TOKENS: TokenInfo[] = [
  {
    address: '0x1291Be112d480055DaFd8a610b7d1e203891C274',
    symbol: 'UDT',
    name: 'UDT Token',
    decimals: 18,
    color: 'bg-purple-500',
  },
  {
    address: '0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154',
    symbol: 'XRP',
    name: 'XRP Token',
    decimals: 18,
    color: 'bg-blue-500',
  },
  {
    address: '0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00',
    symbol: 'ETH',
    name: 'ETH Token',
    decimals: 18,
    color: 'bg-gray-700',
  },
  {
    address: '0x0E801D84Fa97b50751Dbf25036d067dCf18858bF',
    symbol: 'BTC',
    name: 'BTC Token',
    decimals: 18,
    color: 'bg-orange-500',
  },
  {
    address: '0x809d550fca64d94Bd9F66E60752A544199cfAC3D',
    symbol: 'SOL',
    name: 'SOL Token',
    decimals: 18,
    color: 'bg-purple-600',
  },
  {
    address: '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf',
    symbol: 'DOGE',
    name: 'DOGE Token',
    decimals: 18,
    color: 'bg-yellow-500',
  },
  {
    address: '0x36C02dA8a0983159322a80FFE9F24b1acfF8B570',
    symbol: 'SHIB',
    name: 'SHIB Token',
    decimals: 18,
    color: 'bg-red-500',
  },
  {
    address: '0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf',
    symbol: 'ADA',
    name: 'ADA Token',
    decimals: 18,
    color: 'bg-blue-600',
  },
  {
    address: '0x9d4454B023096f34B160D6B654540c56A1F81688',
    symbol: 'DOT',
    name: 'DOT Token',
    decimals: 18,
    color: 'bg-pink-500',
  },
];

// 토큰을 심볼로 찾기
export const getTokenBySymbol = (symbol: string): TokenInfo | undefined => {
  return TOKENS.find((token) => token.symbol === symbol);
};

// 토큰을 주소로 찾기
export const getTokenByAddress = (address: string): TokenInfo | undefined => {
  return TOKENS.find((token) => token.address.toLowerCase() === address.toLowerCase());
};

// ERC-20 ABI (balanceOf, name, symbol, decimals 함수만)
export const ERC20_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'allowance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientAllowance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'ERC20InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidApprover',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidReceiver',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSender',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'ERC20InvalidSpender',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
