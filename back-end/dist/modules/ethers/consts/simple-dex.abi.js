"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'OwnableInvalidOwner',
        type: 'error',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'OwnableUnauthorizedAccount',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'provider',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amountA',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amountB',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'liquidity',
                type: 'uint256',
            },
        ],
        name: 'LiquidityAdded',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'tokenIn',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'tokenOut',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256',
            },
        ],
        name: 'Swap',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amountA',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'amountB',
                type: 'uint256',
            },
        ],
        name: 'addLiquidity',
        outputs: [
            {
                internalType: 'uint256',
                name: 'liquidity',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
            },
        ],
        name: 'getMyLiquidity',
        outputs: [
            {
                internalType: 'uint256',
                name: 'liquidity',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'pools',
        outputs: [
            {
                internalType: 'uint256',
                name: 'tokenAReserve',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'tokenBReserve',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'totalLiquidity',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
            },
        ],
        name: 'resetPool',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'tokenIn',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'tokenOut',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256',
            },
        ],
        name: 'swap',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amountOut',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];
//# sourceMappingURL=simple-dex.abi.js.map