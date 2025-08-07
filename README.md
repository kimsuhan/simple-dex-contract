# 🔥 Hardhat Template

> **A modern, production-ready Ethereum smart contract development template powered by Hardhat & Ignition**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg)](https://hardhat.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ Features

- 🛠️ **Hardhat Toolbox** - Complete development environment
- 🚀 **Ignition Deployment** - Modern, modular deployment system
- 🔍 **TypeChain Integration** - Fully typed smart contract interactions
- 🧪 **Comprehensive Testing** - Advanced testing utilities with fixtures
- ⛽ **Gas Reporting** - Detailed gas usage analysis
- 🌐 **Multi-Network Support** - Local, testnet, and mainnet configurations
- 📊 **Coverage Reports** - Solidity code coverage analysis

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd hardhat-template

# Install dependencies
yarn install
# or
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Network URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_API_KEY

# Private Keys (never commit these!)
PRIVATE_KEY=your_private_key_here

# API Keys for verification and gas reporting
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Gas Reporting
REPORT_GAS=Y
REPORT_GAS_CURRENCY=USD
```

## 🛠️ Development Commands

### Core Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Start local blockchain
npm run node

# Deploy to local network
npm run deploy:local
```

### Advanced Commands

```bash
# Test with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage analysis
npx hardhat coverage

# Deploy specific module
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network sepolia

# Verify contract on Etherscan
npx hardhat verify CONTRACT_ADDRESS --network sepolia

# Get help
npx hardhat help
```

## 📁 Project Structure

```
├── contracts/           # Solidity smart contracts
│   └── Lock.sol        # Sample timelock contract
├── test/               # Test files
│   └── Lock.ts        # Comprehensive test suite
├── ignition/           # Deployment modules
│   └── modules/
│       └── Lock.ts    # Deployment configuration
├── typechain-types/    # Generated TypeScript types
├── hardhat.config.ts   # Hardhat configuration
└── .env               # Environment variables
```

## 🧪 Testing

This template includes a comprehensive test suite demonstrating best practices:

- **Fixtures** - Reusable test setups with `loadFixture`
- **Time manipulation** - Testing time-dependent contracts
- **Event testing** - Verifying emitted events
- **Balance changes** - Testing ETH transfers
- **Error handling** - Testing reverts and custom errors

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run specific test file
npx hardhat test test/Lock.ts
```

## 🌐 Network Configuration

### Local Development

- **Hardhat Network** - Built-in network for testing
- **Localhost** - Local node at `http://127.0.0.1:8545`

### Testnets

- **Sepolia** - Ethereum testnet (configure in `.env`)

### Adding New Networks

Edit `hardhat.config.ts`:

```typescript
networks: {
  polygon: {
    url: process.env.POLYGON_URL || "",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
}
```

## 🚀 Deployment

This template uses **Hardhat Ignition** for reliable, reproducible deployments:

```bash
# Deploy to local network
npm run deploy:local

# Deploy to testnet
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network sepolia

# Deploy with custom parameters
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network sepolia --parameters ./ignition/parameters.json
```

## 📊 Gas Optimization

Enable gas reporting to optimize your contracts:

```bash
# Set environment variable
export REPORT_GAS=Y

# Run tests with gas reporting
npm test
```

The gas reporter will show:

- Gas usage per method
- Deployment costs
- Method signatures
- Uncalled methods

## 🔒 Security Best Practices

- ✅ Never commit private keys or sensitive data
- ✅ Use environment variables for configuration
- ✅ Verify contracts on Etherscan after deployment
- ✅ Run comprehensive tests before mainnet deployment
- ✅ Use latest Solidity version with security features

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ignition Documentation](https://hardhat.org/ignition)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

**Happy Building! 🔨✨**
