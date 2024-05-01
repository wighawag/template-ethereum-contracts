import {EIP1193GenericRequestProvider} from 'eip-1193';
import hre from 'hardhat';
import {loadAndExecuteDeployments} from 'rocketh';
import '@rocketh/deploy';
import {context} from '../../deploy/_context';

export async function deployAll() {
	const provider = hre.network.provider as EIP1193GenericRequestProvider;
	const env = await loadAndExecuteDeployments(
		{
			provider,
		},
		context,
	);

	const GreetingsRegistry = env.get<typeof env.artifacts.GreetingsRegistry.abi>('GreetingsRegistry');
	const deployer = env.namedAccounts.deployer;

	return {env, GreetingsRegistry, deployer, otherAccounts: env.unnamedAccounts};
}
