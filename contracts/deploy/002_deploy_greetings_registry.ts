import {deployScript, artifacts} from '../rocketh/deploy.js';
import {parseEther} from 'viem';

export default deployScript(
	async (env) => {
		const {deployer} = env.namedAccounts;
		const useProxy = !env.tags.live;

		// proxy only in non-live network (localhost and hardhat network) enabling HCR (Hot Contract Replacement)
		// in live network, proxy is disabled and constructor is invoked
		await env.deployViaProxy(
			'GreetingsRegistry',
			{
				account: deployer,
				artifact: artifacts.GreetingsRegistry,
				args: ['2'],
			},
			{
				proxyDisabled: !useProxy,
				execute: 'postUpgrade',
			},
		);

		return !useProxy; // when live network, record the script as executed to prevent rexecution
	},
	{
		tags: ['GreetingsRegistry'],
		id: 'deploy_greetings_registry', // id required to prevent reexecution
	},
);
