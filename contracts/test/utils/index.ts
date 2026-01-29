import {Abi_SimpleERC20} from '../../generated/abis/SimpleERC20.js';
import {Abi_GreetingsRegistry} from '../../generated/abis/GreetingsRegistry.js';
import {loadAndExecuteDeploymentsFromFiles} from '../../rocketh/environment.js';
import {EthereumProvider} from 'hardhat/types/providers';

export function setupFixtures(provider: EthereumProvider) {
	return {
		async deployAll() {
			const env = await loadAndExecuteDeploymentsFromFiles({
				provider: provider,
			});

			// Deployment are inherently untyped since they can vary from
			//  network or even be different from current artifacts so here
			//  we type them manually assuming the artifact is still matching
			const SimpleERC20 = env.get<Abi_SimpleERC20>('SimpleERC20');
			const GreetingsRegistry = env.get<Abi_GreetingsRegistry>('GreetingsRegistry');

			return {
				env,
				SimpleERC20,
				GreetingsRegistry,
				namedAccounts: env.namedAccounts,
				unnamedAccounts: env.unnamedAccounts,
			};
		},
	};
}