import {deployScript, artifacts} from '../rocketh/deploy.js';
// hardhat-deploy hands the Hardhat network connection to rocketh when it runs
// the deploy scripts, and getHardhatConnection reads it back from the
// environment. It throws if there is none, which is the case when the scripts
// run outside Hardhat (see test/js/utils/index.ts for how tests pass it).
import {getHardhatConnection} from 'hardhat-deploy';

export default deployScript(
	async (env) => {
		// Get named accounts configured in rocketh/config.ts
		const {deployer, admin} = env.namedAccounts;

		// The Hardhat connection gives the script what Hardhat and its plugins
		// add to it: here the network name and hardhat-viem's clients.
		const connection = getHardhatConnection(env);
		console.log(`Hardhat network: ${connection.networkName}`);
		const client = await connection.viem.getPublicClient();
		console.log(`Chain id from hardhat-viem: ${await client.getChainId()}`);

		// The prefix will be prepended to all messages
		const prefix = '';

		// Deploy an upgradeable contract using a proxy pattern
		// - The implementation is deployed deterministically
		// - The proxy delegates to the implementation
		// - The admin can upgrade the implementation later
		const deployment = await env.deployViaProxy(
			'GreetingsRegistry',
			{
				account: deployer,
				artifact: artifacts.GreetingsRegistry,
				args: [prefix],
			},
			{
				owner: admin,
				execute: 'init',
				linkedData: {
					prefix,
					admin,
				},
				deterministicImplementation: true,
			},
		);

		// Example: interact with the deployed contract using viem
		const contract = env.viem.getContract(deployment);
		const message = await contract.read.messages([deployer]);
		console.log(`Current message for deployer: "${message}"`);
	},
	// Tags allow selective deployment (e.g., --tags GreetingsRegistry)
	// Dependencies can be specified with: dependencies: ['OtherContract']
	{tags: ['GreetingsRegistry', 'GreetingsRegistry_deploy']},
);
