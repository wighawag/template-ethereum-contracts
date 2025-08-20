// we import what we need from the @rocketh alias, see ../rocketh.ts
import {deployScript, artifacts} from '@rocketh';

export default deployScript(
	// this allow us to define our deploy function which takes as first argument an environment object
	// This contaisn the function provided by the modules imported in 'rocketh.ts'
	// along with other built-in functions and the named accounts
	async (env, data) => {
		const {deployer, admin} = env.namedAccounts;

		const prefix = 'proxy:';
		await env.deployViaProxy(
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
			},
		);
	},
	// execute takes as a second argument an options object where you can specify tags and dependencies
	{tags: ['GreetingsRegistry', 'GreetingsRegistry_deploy']},
);
