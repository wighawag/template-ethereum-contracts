import {deployScript, artifacts} from '../rocketh/deploy.js';
// import {createPublicClient, custom} from 'viem';

export default deployScript(
	// this allow us to define our deploy function which takes as first argument an environment object
	// This contaisn the function provided by the modules imported in 'rocketh.ts'
	// along with other built-in functions and the named accounts
	async (env) => {
		const {deployer, admin} = env.namedAccounts;

		console.log({deployer, admin});

		// const client = env.viem.publicClient;

		const prefix = 'proxy:';
		const deployment = await env.deployViaProxy(
			'GreetingsRegistry',
			{
				account: deployer,
				artifact: artifacts.GreetingsRegistry,
				args: [prefix],
			},
			{
				owner: admin,
				linkedData: {
					prefix,
					admin,
				},
				deterministicImplementation: true,
			},
		);

		const contract = env.viem.getContract(deployment);
		const message = await contract.read.messages([deployer]);
		console.log(message);
	},
	// execute takes as a second argument an options object where you can specify tags and dependencies
	{tags: ['GreetingsRegistry', 'GreetingsRegistry_deploy']},
);
