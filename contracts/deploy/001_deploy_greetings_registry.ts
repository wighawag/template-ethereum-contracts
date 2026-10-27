import {deployScript, artifacts} from '../rocketh/deploy.js';

export default deployScript(
	async (env) => {
		// Get named accounts configured in rocketh/config.ts
		const {deployer, admin} = env.namedAccounts;

		// The prefix will be prepended to all messages
		const prefix = 'v2: ';

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
	// on a network with a Safe, `admin` IS that Safe, so it has to exist first
	{
		tags: ['GreetingsRegistry', 'GreetingsRegistry_deploy'],
		dependencies: ['Safe'],
	},
);
