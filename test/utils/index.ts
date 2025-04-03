import type {EIP1193GenericRequestProvider} from 'eip-1193';
import hre from 'hardhat';
import {Abi_GreetingsRegistry} from '@generated/types/GreetingsRegistry.js';
import {loadAndExecuteDeployments} from '@rocketh';

export async function deployAll() {
	const provider = hre.network.provider as EIP1193GenericRequestProvider;
	const env = await loadAndExecuteDeployments({
		provider,
	});

	const GreetingsRegistry = env.get<Abi_GreetingsRegistry>('GreetingsRegistry');
	const deployer = env.namedAccounts.deployer;

	return {env, GreetingsRegistry, deployer, unnamedAccounts: env.unnamedAccounts};
}
