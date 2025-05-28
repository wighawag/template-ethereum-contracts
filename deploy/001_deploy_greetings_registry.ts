// we import what we need from the @rocketh alias, see ../rocketh.ts
import {execute} from '@rocketh';
// import artifacts from '@ensdomains/ens-contracts/artifacts/artifacts.js';

export default execute(
	// this allow us to define our deploy function which takes as first argument an environment object
	// This contaisn the function provided by the modules imported in 'rocketh.ts'
	// along with other built-in functions and the named accounts
	async ({deployViaProxy, namedAccounts}) => {
		console.log(`from project itself`);
		const {deployer, admin} = namedAccounts;

		const prefix = 'proxy:';
		await deployViaProxy(
			'GreetingsRegistryFromImport',
			{
				account: deployer,
				artifact: artifacts.UniversalResolver,
				args: [`0x${'00'.repeat(20)}`, []],
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
	{tags: ['GreetingsRegistryFromImport', 'GreetingsRegistryFromImport_deploy']},
);
