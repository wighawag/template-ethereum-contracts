import {loadFixture} from '@nomicfoundation/hardhat-network-helpers';
import {expect} from 'earl';
import {describe, it} from 'node:test'; // using node:te
import {deployAll} from './utils/index.js';

describe('GreetingsRegistry', function () {
	it('basic test', async function () {
		const {env, GreetingsRegistry, unnamedAccounts} = await loadFixture(deployAll);
		const greetingToSet = 'hello world';
		const greeter = unnamedAccounts[0];
		await expect(
			await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [greeter],
			}),
		).toEqual('');

		await env.execute(GreetingsRegistry, {functionName: 'setMessage', args: [greetingToSet], account: greeter});

		await expect(
			await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [greeter],
			}),
		).toEqual(greetingToSet);
	});
});
