import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const SimpleDexModule = buildModule('SimpleDexModule', (m) => {
  const simpleDex = m.contract('SimpleDex', []);

  interface Token {
    name: string;
    symbol: string;
    initialSupply: number;
  }

  const tokenList: Token[] = [
    { name: 'UDT', symbol: 'UDT', initialSupply: 10000 },
    { name: 'XRP', symbol: 'XRP', initialSupply: 10000 },
    { name: 'ETH', symbol: 'ETH', initialSupply: 10000 },
    { name: 'BTC', symbol: 'BTC', initialSupply: 10000 },
    { name: 'SOL', symbol: 'SOL', initialSupply: 10000 },
    { name: 'DOGE', symbol: 'DOGE', initialSupply: 10000 },
    { name: 'SHIB', symbol: 'SHIB', initialSupply: 10000 },
    { name: 'ADA', symbol: 'ADA', initialSupply: 10000 },
    { name: 'DOT', symbol: 'DOT', initialSupply: 10000 },
  ];

  const tokenContracts: Record<string, any> = {};
  for (const token of tokenList) {
    const contract = m.contract(token.name, [token.name, token.symbol, token.initialSupply]);
    tokenContracts[token.symbol] = contract;
  }

  return { simpleDex, ...tokenContracts };
});

export default SimpleDexModule;
