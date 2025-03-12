// import {loadFixture} from '@nomicfoundation/hardhat-network-helpers';
import {expect} from 'earl';
import {describe, it} from 'node:test'; // using node:test as hardhat v3 do not support vitest

import {deployAll} from './utils/index.js';

describe('GreetingsRegistry', function () {
	it('basic test', async function () {
		const {env, GreetingsRegistry, otherAccounts} = await deployAll(); // await loadFixture(deployAll);
		const greetingToSet = 'hello world';
		const greeter = otherAccounts[0];
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
