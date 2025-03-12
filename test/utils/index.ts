import {EIP1193GenericRequestProvider} from 'eip-1193';
import {loadAndExecuteDeployments} from 'rocketh';
import {context} from '../../deploy/_context.js';
import {EthereumProvider} from 'hardhat/types/providers';

export function setupFixtures(provider: EthereumProvider) {
	return {
		async deployAll() {
			const env = await loadAndExecuteDeployments(
				{
					provider: provider as EIP1193GenericRequestProvider,
				},
				context,
			);

			const GreetingsRegistry = env.get<typeof env.artifacts.GreetingsRegistry.abi>('GreetingsRegistry');
			const deployer = env.namedAccounts.deployer;

			return {env, GreetingsRegistry, deployer, otherAccounts: env.unnamedAccounts};
		},
	};
}
