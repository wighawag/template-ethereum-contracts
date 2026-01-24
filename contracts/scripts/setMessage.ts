import hre from 'hardhat';
import {Abi_GreetingsRegistry} from '../generated/abis/GreetingsRegistry.js';
import {loadEnvironmentFromHardhat} from '../rocketh/environment.js';

async function main(args: string[]) {
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
		args: [args[0] || ''],
		gas: 100000n,
	});

	const after_messages = await env.read(GreetingsRegistry, {
		functionName: 'messages',
		args: [env.namedAccounts.deployer],
	});
	console.log(after_messages);
}
main(process.argv.slice(2));
