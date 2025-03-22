import hre from 'hardhat';
import {loadEnvironmentFromHardhat} from 'hardhat-deploy/helpers';
import {Abi_GreetingsRegistry} from '@generated/types/GreetingsRegistry.js';

async function main() {
	const env = await loadEnvironmentFromHardhat({hre});
	const GreetingsRegistry = env.get<Abi_GreetingsRegistry>('GreetingsRegistry');

	const before_messages = await env.read(GreetingsRegistry, {
		functionName: 'messages',
		args: [env.namedAccounts.deployer],
	});

	console.log(before_messages);

	await env.execute(GreetingsRegistry, {
		account: env.namedAccounts.deployer,
		functionName: 'setMessage',
		args: ['hello'],
	});

	const after_messages = await env.read(GreetingsRegistry, {
		functionName: 'messages',
		args: [env.namedAccounts.deployer],
	});
	console.log(after_messages);
}
main();
