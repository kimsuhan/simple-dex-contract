import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleDexModule = buildModule("SimpleDexModule", (m) => {
  const simpleDex = m.contract("SimpleDex", []);

  return { simpleDex };
});

export default SimpleDexModule;
