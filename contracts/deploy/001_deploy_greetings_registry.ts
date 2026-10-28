import {deployScript} from '../rocketh/deploy.js';
// The artifacts of the package we depend on: this project has no
// GreetingsRegistry source of its own (its contract is DuplicateGreetingsRegistry).
import * as importedArtifacts from 'template-ethereum-contracts-deploy-export/artifacts/index.js';

export default deployScript(
	async (env) => {
		const {deployer, admin} = env.namedAccounts;

		// The imported package's own deploy script (re-exported by
		// 000_deploy_greetings_registry_from_package.ts) has already deployed
		// `GreetingsRegistry`. Here we deploy a second instance under our own
		// name, from the imported artifact.
		const prefix = 'proxy:';
		const deployment = await env.deployViaProxy(
			'GreetingsRegistryFromImport',
			{
				account: deployer,
				artifact: importedArtifacts.GreetingsRegistry,
				args: [prefix],
			},
			{
				owner: admin,
				execute: 'init',
				linkedData: {
					prefix,
					admin,
				},
			},
		);
		console.log(`GreetingsRegistryFromImport at ${deployment.address}`);
	},
	{
		tags: ['GreetingsRegistryFromImport', 'GreetingsRegistryFromImport_deploy'],
		dependencies: ['GreetingsRegistry'],
	},
);
