import {Abi_GreetingsRegistry} from '../../../generated/abis/GreetingsRegistry.js';
import {loadAndExecuteDeploymentsFromFiles} from '../../../rocketh/environment.js';
import type {NetworkConnection} from 'hardhat/types/network';

export function setupFixtures(connection: NetworkConnection) {
	return {
		async deployAll() {
			const env = await loadAndExecuteDeploymentsFromFiles({
				provider: connection.provider,
				// the deploy script reads the Hardhat connection through
				// getHardhatConnection (from hardhat-deploy), which finds it here
				extra: {connection},
			});

			// Deployment are inherently untyped since they can vary from
			//  network or even be different from current artifacts so here
			//  we type them manually assuming the artifact is still matching
			const GreetingsRegistry =
				env.get<Abi_GreetingsRegistry>('GreetingsRegistry');

			return {
				env,
				GreetingsRegistry,
				namedAccounts: env.namedAccounts,
				unnamedAccounts: env.unnamedAccounts,
			};
		},
	};
}
