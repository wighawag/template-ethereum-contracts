import {EIP1193GenericRequestProvider} from 'eip-1193';
import {loadAndExecuteDeployments} from 'rocketh';
import '@rocketh/deploy';
import {context} from '../../deploy/_context.js';
import {network} from 'hardhat';
// import '@rocketh/deploy';
// import {context} from '../../deploy/_context.js';
// import hre from '@ignored/hardhat-vnext';
// import {loadEnvironmentFromHardhat} from 'hardhat3-rocketh/helpers';

export async function deployAll() {
	// const env = await loadEnvironmentFromHardhat({hre, context});
	const {provider} = await network.connect();
	const env = await loadAndExecuteDeployments(
		{
			provider: provider as EIP1193GenericRequestProvider,
		},
		context,
	);

	const GreetingsRegistry = env.get<typeof env.artifacts.GreetingsRegistry.abi>('GreetingsRegistry');
	const deployer = env.namedAccounts.deployer;

	return {env, GreetingsRegistry, deployer, otherAccounts: env.unnamedAccounts};
}
