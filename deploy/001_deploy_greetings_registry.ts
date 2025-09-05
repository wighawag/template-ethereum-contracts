// we import what we need from the #rocketh alias, see ../rocketh.ts
import {deployScript, artifacts} from '#rocketh';
// import {createPublicClient, custom} from 'viem';

export default deployScript(
	// this allow us to define our deploy function which takes as first argument an environment object
	// This contaisn the function provided by the modules imported in 'rocketh.ts'
	// along with other built-in functions and the named accounts
	async (env) => {
		const {deployer, admin} = env.namedAccounts;

		// const client = env.viem.publicClient;

		const prefix = 'proxy:';
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
			},
		);

		const contract = env.viem.getContract(deployment);
		const message = await contract.read.messages([deployer]);
		console.log(message);
	},
	// execute takes as a second argument an options object where you can specify tags and dependencies
	{tags: ['GreetingsRegistry', 'GreetingsRegistry_deploy']},
);
