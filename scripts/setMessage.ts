import {loadEnvironment} from 'rocketh';
import {context} from '../deploy/_context';
import hre from 'hardhat';
import { EIP1193GenericRequestProvider } from 'eip-1193';
import "@rocketh/deploy";

async function main() {
	const env = await loadEnvironment(
		{
			provider: hre.network.provider as EIP1193GenericRequestProvider,
			network: hre.network.name,
		},
		context,
	);

	const GreetingsRegistry = env.get<typeof context.artifacts.GreetingsRegistry.abi>('GreetingsRegistry');
	
	const tx = await env.execute(GreetingsRegistry, {
		functionName: 'setMessage',
		args: ["hello"],
		account: env.namedAccounts.deployer,
	});
	console.log(tx);
}
main();
