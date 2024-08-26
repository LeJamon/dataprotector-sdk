import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-etherscan';

const { WALLET_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    // modify with the dev network when the environment is ready
    bellecour: {
      url: 'https://bellecour.iex.ec',
      gasPrice: 0,
      accounts: WALLET_PRIVATE_KEY ? [WALLET_PRIVATE_KEY] : [],
    },
    // poco-chain native config
    'dev-native': {
      chainId: 65535,
      url: 'http://chain.wp-throughput.az1.internal:8545',
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
      },
      gasPrice: 0,
    },
  },
  //to verify contract on Blockscout
  etherscan: {
    apiKey: {
      bellecour: 'abc',
      'dev-native': 'abc',
    },
    customChains: [
      {
        network: 'bellecour',
        chainId: 134,
        urls: {
          apiURL: 'https://blockscout-bellecour.iex.ec/api',
          browserURL: 'https://blockscout-bellecour.iex.ec',
        },
      },
      {
        network: 'dev-native',
        chainId: 65535,
        urls: {
          apiURL: 'http://chain.wp-throughput.az1.internal:4000/api',
          browserURL: 'http://chain.wp-throughput.az1.internal:4000',
        },
      },
    ],
  },
  //compiler version
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
export default config;
