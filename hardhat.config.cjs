const {loadEnv} = require('ldenv');
loadEnv();
require('@nomicfoundation/hardhat-network-helpers');
const {addForkConfiguration, addNetworksFromEnv} = require('hardhat-rocketh');

const {task} = require('hardhat/config');
// we override the node task to set up our block time interval
// setting it up in the config below would also set it in tests and we do not want that
task('node').setAction(async (args, hre, runSuper) => {
	if (process.env['BLOCK_TIME']) {
		hre.config.networks.hardhat.mining = hre.config.networks.hardhat.mining || {};
		hre.config.networks.hardhat.mining.auto = true;
		hre.config.networks.hardhat.mining.interval = parseInt(process.env['BLOCK_TIME']) * 1000;
	}
	return runSuper(args);
});

const defaultVersion = '0.8.25';
const defaultSettings = {
	optimizer: {
		enabled: true,
		runs: 999999,
	},
	viaIR: true,
	outputSelection: {
		'*': {
			'*': ['evm.methodIdentifiers'],
		},
	},
};

const config = {
	solidity: {
		compilers: [
			{
				version: defaultVersion,
				settings: {...defaultSettings},
			},
		],
	},
	networks:
		// this setup forking for netwoirk if env var HARDHAT_FORK is set
		addForkConfiguration(
			// this add network for each respective env var found (ETH_NODE_URI_<network>)
			addNetworksFromEnv({
				hardhat: {
					initialBaseFeePerGas: process.env.HARDHAT_FORK ? 1 : 0,
					allowUnlimitedContractSize: process.env.HARDHAT_FORK ? false : true,
				},
			}),
		),
	paths: {
		sources: 'src',
	},
};

module.exports = config;
