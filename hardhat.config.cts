import 'dotenv/config';
import {HardhatUserConfig} from 'hardhat/types';

import {join} from 'path';
import {writeFile} from 'fs/promises';
import {subtask} from 'hardhat/config';
import {TASK_COMPILE_SOLIDITY} from 'hardhat/builtin-tasks/task-names';

import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-ethers';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-deploy-tenderly';

import {node_url, accounts, addForkConfiguration} from './utils/network.cjs';

// overriding 'hardhat' compile solidity task to generate "commonjs" 'package.json' for typechain after compilation
// see: https://github.com/NomicFoundation/hardhat/issues/3385#issuecomment-1841380253

subtask(TASK_COMPILE_SOLIDITY).setAction(async (_, {config}, runSuper) => {
	const superRes = await runSuper();
	const basePath = config.paths.root;
	const packageJsonContent = '{ "type": "commonjs" }';
	const paths = ['typechain-types'];

	const writePackageJson = async (path: string) => {
		const fullPath = join(basePath, path, 'package.json');
		try {
			await writeFile(fullPath, packageJsonContent);
		} catch (error) {
			console.error(`Error writing package.json at ${path}: `, error);
		}
	};

	await Promise.all(paths.map(writePackageJson));

	return superRes;
});

const config: HardhatUserConfig = {
	solidity: {
		compilers: [
			{
				version: '0.8.17',
				settings: {
					optimizer: {
						enabled: true,
						runs: 2000,
					},
				},
			},
		],
	},
	namedAccounts: {
		deployer: 0,
		simpleERC20Beneficiary: 1,
	},
	networks: addForkConfiguration({
		hardhat: {
			initialBaseFeePerGas: 0, // to fix : https://github.com/sc-forks/solidity-coverage/issues/652, see https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136
		},
		localhost: {
			url: node_url('localhost'),
			accounts: accounts(),
		},
		staging: {
			url: node_url('rinkeby'),
			accounts: accounts('rinkeby'),
		},
		production: {
			url: node_url('mainnet'),
			accounts: accounts('mainnet'),
		},
		mainnet: {
			url: node_url('mainnet'),
			accounts: accounts('mainnet'),
		},
		sepolia: {
			url: node_url('sepolia'),
			accounts: accounts('sepolia'),
		},
		kovan: {
			url: node_url('kovan'),
			accounts: accounts('kovan'),
		},
		goerli: {
			url: node_url('goerli'),
			accounts: accounts('goerli'),
		},
	}),
	paths: {
		sources: 'src',
	},
	gasReporter: {
		currency: 'USD',
		gasPrice: 100,
		enabled: process.env.REPORT_GAS ? true : false,
		coinmarketcap: process.env.COINMARKETCAP_API_KEY,
		maxMethodDiff: 10,
	},
	mocha: {
		timeout: 0,
	},
	external: process.env.HARDHAT_FORK
		? {
				deployments: {
					// process.env.HARDHAT_FORK will specify the network that the fork is made from.
					// these lines allow it to fetch the deployments from the network being forked from both for node and deploy task
					hardhat: ['deployments/' + process.env.HARDHAT_FORK],
					localhost: ['deployments/' + process.env.HARDHAT_FORK],
				},
		  }
		: undefined,

	tenderly: {
		project: 'template-ethereum-contracts',
		username: process.env.TENDERLY_USERNAME as string,
	},
};

export default config;
