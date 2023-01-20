import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_GOERLI_KEY = process.env.ALCHEMY_GOERLI_KEY as string;
const ALCHEMY_MAINNET_KEY = process.env.ALCHEMY_MAINNET_KEY as string;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  // networks: {
  //   goerli: {
  //     url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_GOERLI_KEY}`,
  //     accounts: [PRIVATE_KEY]
  //   },
  //   mainnet: {
  //     url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_MAINNET_KEY}`,
  //     accounts: [PRIVATE_KEY]
  //   }
  // },
  // gasReporter: {
  //   enabled: true
  // }
};

export default config;
