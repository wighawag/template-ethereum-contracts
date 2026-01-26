import { expect } from 'earl';
import { describe, it } from 'node:test';
import { network } from 'hardhat';
import { setupFixtures } from './utils/index.js';

const { provider, networkHelpers } = await network.connect();
const { deployAll } = setupFixtures(provider);

describe('GreetingsRegistry', function () {
	describe('messages', function () {
		it('should return empty string for accounts that have not set a message', async function () {
			const { env, GreetingsRegistry, unnamedAccounts } =
				await networkHelpers.loadFixture(deployAll);
			const user = unnamedAccounts[0];

			const message = await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [user],
			});

			expect(message).toEqual('');
		});
	});

	describe('setMessage', function () {
		it('should store the message for the caller', async function () {
			const { env, GreetingsRegistry, unnamedAccounts } =
				await networkHelpers.loadFixture(deployAll);
			const prefix = '';
			const greetingToSet = 'hello world';
			const greeter = unnamedAccounts[0];

			await env.execute(GreetingsRegistry, {
				functionName: 'setMessage',
				args: [greetingToSet],
				account: greeter,
			});

			const storedMessage = await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [greeter],
			});

			// Note: The contract prepends a prefix to all messages
			expect(storedMessage).toEqual(`${prefix}${greetingToSet}`);
		});

		it('should allow different users to set different messages', async function () {
			const { env, GreetingsRegistry, unnamedAccounts } =
				await networkHelpers.loadFixture(deployAll);
			const prefix = '';
			const user1 = unnamedAccounts[0];
			const user2 = unnamedAccounts[1];
			const message1 = 'hello from user 1';
			const message2 = 'greetings from user 2';

			await env.execute(GreetingsRegistry, {
				functionName: 'setMessage',
				args: [message1],
				account: user1,
			});

			await env.execute(GreetingsRegistry, {
				functionName: 'setMessage',
				args: [message2],
				account: user2,
			});

			const storedMessage1 = await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [user1],
			});
			const storedMessage2 = await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [user2],
			});

			expect(storedMessage1).toEqual(`${prefix}${message1}`);
			expect(storedMessage2).toEqual(`${prefix}${message2}`);
		});

		it('should allow updating an existing message', async function () {
			const { env, GreetingsRegistry, unnamedAccounts } =
				await networkHelpers.loadFixture(deployAll);
			const user = unnamedAccounts[0];
			const prefix = '';
			const initialMessage = 'initial greeting';
			const updatedMessage = 'updated greeting';

			await env.execute(GreetingsRegistry, {
				functionName: 'setMessage',
				args: [initialMessage],
				account: user,
			});

			await env.execute(GreetingsRegistry, {
				functionName: 'setMessage',
				args: [updatedMessage],
				account: user,
			});

			const storedMessage = await env.read(GreetingsRegistry, {
				functionName: 'messages',
				args: [user],
			});

			expect(storedMessage).toEqual(`${prefix}${updatedMessage}`);
		});

		it('should revert when setting an empty message', async function () {
			const { env, GreetingsRegistry, unnamedAccounts } =
				await networkHelpers.loadFixture(deployAll);
			const user = unnamedAccounts[0];

			await expect(
				env.execute(GreetingsRegistry, {
					functionName: 'setMessage',
					args: [''],
					account: user,
					gas: 1000000n,
				}),
			).toBeRejectedWith(`custom error 'InvalidMessage("")'`);
		});
	});
});