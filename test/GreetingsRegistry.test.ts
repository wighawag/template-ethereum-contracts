import {loadFixture} from '@nomicfoundation/hardhat-network-helpers';
import {expect, describe, it} from 'vitest';
import {deployAll} from './utils';

describe('GreetingsRegistry', function () {
	it('basic test', async function () {
		const {env, GreetingsRegistry, otherAccounts} = await loadFixture(deployAll);
		const greetingToSet = 'hello world';
		const greeter = otherAccounts[0];
		await expect(
			await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [greeter],
			}),
		).to.equal('');

		await env.execute(GreetingsRegistry, {functionName: 'setMessage', args: [greetingToSet], account: greeter});

		await expect(
			await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [greeter],
			}),
		).to.equal(greetingToSet);
	});
});
