// we import the context that set all that is needed (see ../context.ts)
import {execute, artifacts} from '@rocketh';

export default execute(
	async ({deployViaProxy, namedAccounts}) => {
		console.log('deploying GreetingsRegistry...');
		const {deployer, admin} = namedAccounts;

		const prefix = 'proxy:';
		await deployViaProxy(
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
	// finally you can pass tags and dependencies
	{tags: ['GreetingsRegistry', 'GreetingsRegistry_deploy']},
);
