import {context} from '../deploy/_context.js';
import '@rocketh/deploy';
import {network} from '@ignored/hardhat-vnext';
import {loadEnvironment} from 'rocketh';

// We connect to the default network (which can be controlled with `--network`),
// and use the `optimism` chain type, so that we get the right viem extensions.
const {provider} = await network.connect();

async function main() {
	const args = process.argv.slice(2);
	const greeting = args[0] || 'hello';

	const env = await loadEnvironment(
		{
			provider: provider as any,
		},
		context,
	);

	const GreetingsRegistry = env.get<typeof context.artifacts.GreetingsRegistry.abi>('GreetingsRegistry');

	const tx = await env.execute(GreetingsRegistry, {
		functionName: 'setMessage',
		args: [greeting],
		account: env.namedAccounts.deployer,
	});
	console.log(tx);
}
main();
