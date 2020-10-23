// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import {Wallet} from '@ethersproject/wallet';
import {HardhatUserConfig} from 'hardhat/types';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';

// usePlugin('solidity-coverage');

let mnemonic = process.env.MNEMONIC;
if (!mnemonic) {
  mnemonic = Wallet.createRandom().mnemonic.phrase;
}
const accounts = {
  mnemonic,
};

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.3',
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    coverage: {
      url: 'http://localhost:5458',
      accounts,
    },
    hardhat: {
      accounts,
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts,
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/' + process.env.INFURA_TOKEN,
      accounts,
    },
    42: {
      url: 'https://kovan.infura.io/v3/' + process.env.INFURA_TOKEN,
      accounts,
    },
    staging: {
      url: 'https://goerli.infura.io/v3/' + process.env.INFURA_TOKEN,
      accounts,
    },
  },
  paths: {
    sources: 'src',
  },
};

export default config;
