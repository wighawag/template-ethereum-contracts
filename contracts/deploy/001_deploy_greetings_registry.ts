import {deployScript, artifacts} from '../rocketh/deploy.js';

export default deployScript(
	async (env) => {
		// Get named accounts configured in rocketh/config.ts
		const {deployer, admin} = env.namedAccounts;

		// The prefix will be prepended to all messages
		const prefix = '';

		// Deploy an upgradeable contract using a proxy pattern
		// - The implementation is deployed deterministically
		// - The proxy delegates to the implementation
		// - The admin can upgrade the implementation later
		//
		// GreetingsRegistry has no constructor, so the implementation is
		// deployed without `args`. The prefix is passed to its `initialize`
		// function instead, which the proxy calls in the transaction that
		// deploys it.
		const deployment = await env.deployViaProxy(
			'GreetingsRegistry',
			{
				account: deployer,
				artifact: artifacts.GreetingsRegistry,
			},
			{
				owner: admin,
				execute: {
					methodName: 'initialize',
					args: [prefix],
				},
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
