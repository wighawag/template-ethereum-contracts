import {expect} from 'earl';
import {describe, it} from 'node:test';
import {network} from 'hardhat';
import {EthereumProvider} from 'hardhat/types/providers';
import {loadAndExecuteDeploymentsFromFiles} from '../rocketh/environment.js';
import {Abi_GreetingsRegistry} from '../generated/abis/GreetingsRegistry.js';

function setupFixtures(provider: EthereumProvider) {
	return {
		async deployAll() {
			const env = await loadAndExecuteDeploymentsFromFiles({
				provider: provider,
			});

			// Deployment are inherently untyped since they can vary from
			//  network or even be different from current artifacts so here
			//  we type them manually assuming the artifact is still matching
			const GreetingsRegistry = env.get<Abi_GreetingsRegistry>('GreetingsRegistry');

			return {
				env,
				GreetingsRegistry,
				namedAccounts: env.namedAccounts,
				unnamedAccounts: env.unnamedAccounts,
			};
		},
	};
}

const {provider, networkHelpers} = await network.connect();
const {deployAll} = setupFixtures(provider);

describe('GreetingsRegistry', function () {
	it('setMessage works', async function () {
		const {env, GreetingsRegistry, unnamedAccounts} = await networkHelpers.loadFixture(deployAll);
		const testMessage = 'Hello World';

		await env.execute(GreetingsRegistry, {
			account: unnamedAccounts[0],
			functionName: 'setMessage',
			args: [testMessage],
		});
	});
});