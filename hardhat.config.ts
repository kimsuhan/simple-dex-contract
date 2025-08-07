import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      ...(process.env.PRIVATE_KEY
        ? {
            accounts: [process.env.PRIVATE_KEY],
          }
        : {}),
    },
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS || "N") === "Y",
    currency: process.env.REPORT_GAS_CURRENCY || "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    etherscan: process.env.ETHERSCAN_API_KEY,
    showMethodSig: true, // 메서드 시그니처 표시
    showUncalledMethods: true, // 호출 안된 메서드도 표시
  },
};

export default config;
