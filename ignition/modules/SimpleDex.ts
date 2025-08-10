import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const SimpleDexModule = buildModule('SimpleDexModule', (m) => {
  const simpleDex = m.contract('SimpleDex', []);
  const testTokenA = m.contract('TestTokenA', []);
  const testTokenB = m.contract('TestTokenB', []);

  return { simpleDex, testTokenA, testTokenB };
});

export default SimpleDexModule;
