import {loadEnvironmentFromHardhat} from 'hardhat-rocketh/helpers';
import {context} from '../deploy/_context';
import hre from 'hardhat';
import '@rocketh/deploy';

async function main() {
	const args = process.argv.slice(2);
	const greeting = args[0] || 'hello';

	const env = await loadEnvironmentFromHardhat({
		hre,
		context,
	});

	const GreetingsRegistry = env.get<typeof context.artifacts.GreetingsRegistry.abi>('GreetingsRegistry');

	const tx = await env.execute(GreetingsRegistry, {
		functionName: 'setMessage',
		args: [greeting],
		account: env.namedAccounts.deployer,
	});
	console.log(tx);
}
main();
