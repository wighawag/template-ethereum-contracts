import 'dotenv/config';
import {HDAccountsUserConfig, HttpNetworkUserConfig, NetworksUserConfig} from 'hardhat/types';
export function node_url(networkName: string): string {
	if (networkName) {
		const uri = process.env['ETH_NODE_URI_' + networkName.toUpperCase()];
		if (uri && uri !== '') {
			return uri;
		}
	}

	if (networkName === 'localhost') {
		// do not use ETH_NODE_URI
		return 'http://localhost:8545';
	}

	let uri = process.env.ETH_NODE_URI;
	if (uri) {
		uri = uri.replace('{{networkName}}', networkName);
	}
	if (!uri || uri === '') {
		// throw new Error(`environment variable "ETH_NODE_URI" not configured `);
		return '';
	}
	if (uri.indexOf('{{') >= 0) {
		throw new Error(`invalid uri or network not supported by node provider : ${uri}`);
	}
	return uri;
}

export function getMnemonic(networkName?: string): string {
	if (networkName) {
		const mnemonic = process.env['MNEMONIC_' + networkName.toUpperCase()];
		if (mnemonic && mnemonic !== '') {
			return mnemonic;
		}
	}

	const mnemonic = process.env.MNEMONIC;
	if (!mnemonic || mnemonic === '') {
		return 'test test test test test test test test test test test junk';
	}
	return mnemonic;
}

export function accounts(networkName?: string): {mnemonic: string} {
	return {mnemonic: getMnemonic(networkName)};
}

export function addForkConfiguration(networks: NetworksUserConfig): NetworksUserConfig {
	// While waiting for hardhat PR: https://github.com/nomiclabs/hardhat/pull/1542
	if (process.env.HARDHAT_FORK) {
		process.env['HARDHAT_DEPLOY_FORK'] = process.env.HARDHAT_FORK;
	}

	const currentNetworkName = process.env.HARDHAT_FORK;
	let forkURL: string | undefined = currentNetworkName && node_url(currentNetworkName);
	let hardhatAccounts: HDAccountsUserConfig | undefined;
	if (currentNetworkName && currentNetworkName !== 'hardhat') {
		const currentNetwork = networks[currentNetworkName] as HttpNetworkUserConfig;
		if (currentNetwork) {
			forkURL = currentNetwork.url;
			if (
				currentNetwork.accounts &&
				typeof currentNetwork.accounts === 'object' &&
				'mnemonic' in currentNetwork.accounts
			) {
				hardhatAccounts = currentNetwork.accounts;
			}
		}
	}

	const newNetworks = {
		...networks,
		hardhat: {
			...networks.hardhat,
			...{
				accounts: hardhatAccounts,
				forking: forkURL
					? {
							url: forkURL,
							blockNumber: process.env.HARDHAT_FORK_NUMBER
								? parseInt(process.env.HARDHAT_FORK_NUMBER)
								: undefined,
					  }
					: undefined,
				mining: process.env.MINING_INTERVAL
					? {
							auto: false,
							interval: process.env.MINING_INTERVAL.split(',').map((v) => parseInt(v)) as [
								number,
								number
							],
					  }
					: undefined,
			},
		},
	};
	return newNetworks;
}
