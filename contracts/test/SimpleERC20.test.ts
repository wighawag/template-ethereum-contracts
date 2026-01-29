import {expect} from 'earl';
import {describe, it} from 'node:test';
import {network} from 'hardhat';
import {EthereumProvider} from 'hardhat/types/providers';
import {loadAndExecuteDeploymentsFromFiles} from '../rocketh/environment.js';
import {Abi_SimpleERC20} from '../generated/abis/SimpleERC20.js';

function setupFixtures(provider: EthereumProvider) {
	return {
		async deployAll() {
			const env = await loadAndExecuteDeploymentsFromFiles({
				provider: provider,
			});

			// Deployment are inherently untyped since they can vary from
			//  network or even be different from current artifacts so here
			//  we type them manually assuming the artifact is still matching
			const SimpleERC20 = env.get<Abi_SimpleERC20>('SimpleERC20');

			return {
				env,
				SimpleERC20,
				namedAccounts: env.namedAccounts,
				unnamedAccounts: env.unnamedAccounts,
			};
		},
	};
}

const {provider, networkHelpers} = await network.connect();
const {deployAll} = setupFixtures(provider);

describe('SimpleERC20', function () {
	it('transfer fails', async function () {
		const {env, SimpleERC20, unnamedAccounts} = await networkHelpers.loadFixture(deployAll);

		await expect(
			env.execute(SimpleERC20, {
				account: unnamedAccounts[0],
				functionName: 'transfer',
				args: [unnamedAccounts[1], 1n],
			}),
		).toBeRejectedWith('NOT_ENOUGH_TOKENS');
	});

	it('transfer succeed', async function () {
		const {env, SimpleERC20, unnamedAccounts, namedAccounts} =
			await networkHelpers.loadFixture(deployAll);

		await env.execute(SimpleERC20, {
			account: namedAccounts.simpleERC20Beneficiary,
			functionName: 'transfer',
			args: [unnamedAccounts[1], 1n],
		});

		await env.execute(SimpleERC20, {
			account: namedAccounts.simpleERC20Beneficiary,
			functionName: 'transfer',
			args: [unnamedAccounts[1], 1n],
		});
	});
});