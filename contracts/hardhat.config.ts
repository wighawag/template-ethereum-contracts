import type {HardhatUserConfig} from 'hardhat/config';

import HardhatNodeTestRunner from '@nomicfoundation/hardhat-node-test-runner';
import HardhatViem from '@nomicfoundation/hardhat-viem';
import HardhatNetworkHelpers from '@nomicfoundation/hardhat-network-helpers';
import HardhatKeystore from '@nomicfoundation/hardhat-keystore';

import HardhatDeploy from 'hardhat-deploy';
import {
	addForkConfiguration,
	addNetworksFromEnv,
	addNetworksFromKnownList,
} from 'hardhat-deploy/helpers';

const config: HardhatUserConfig = {
	plugins: [
		HardhatNodeTestRunner,
		HardhatViem,
		HardhatNetworkHelpers,
		HardhatKeystore,
		HardhatDeploy,
	],
	solidity: {
		profiles: {
			default: {
				version: '0.8.28',
			},
			production: {
				version: '0.8.28',
				settings: {
					optimizer: {
						enabled: true,
						runs: 999999,
					},
				},
			},
		},
	},
	networks:
		// This add the fork configuration for chosen network
		addForkConfiguration(
			// this add a network config for all known chain using kebab-cases names
			// Note that MNEMONIC_<network> (or MNEMONIC if the other is not set) will
			// be used for account
			// Similarly ETH_NODE_URI_<network> will be used for rpcUrl
			// Note that if you set these env variable to have the value: "SECRET" it will be like using:
			//  configVariable('SECRET_ETH_NODE_URI_<network>')
			//  configVariable('SECRET_MNEMONIC_<network>')
			addNetworksFromKnownList(
				// this add network for each respective env var found (ETH_NODE_URI_<network>)
				// it will also read MNEMONIC_<network> to populate the accounts
				// And like above it will use configVariable if set to SECRET
				addNetworksFromEnv(
					// and you can add in your specific network here
					{
						default: {
							type: 'edr-simulated',
							chainType: 'l1',
							accounts: {
								mnemonic: process.env.MNEMONIC || undefined,
							},
						},
					},
				),
			),
		),
	paths: {
		sources: ['src'],
	},
	generateTypedArtifacts: {
		destinations: [
			{
				folder: './generated',
				mode: 'typescript',
			},
		],
	},
};

export default config;
