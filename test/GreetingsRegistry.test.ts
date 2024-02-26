import {expect} from 'chai';
import hre from 'hardhat';
const {ethers, deployments, getUnnamedAccounts} = hre;
import {GreetingsRegistry} from '../typechain-types/index.js';
import UtilsModule from './utils/index.cjs';
const {setupUsers} = UtilsModule;

const setup = deployments.createFixture(async () => {
	await deployments.fixture('GreetingsRegistry');
	const contracts = {
		GreetingsRegistry: await ethers.getContract<GreetingsRegistry>('GreetingsRegistry'),
	};
	const users = await setupUsers(await getUnnamedAccounts(), contracts);
	return {
		...contracts,
		users,
	};
});
describe('GreetingsRegistry', function () {
	it('setMessage works', async function () {
		const {users, GreetingsRegistry} = await setup();
		const testMessage = 'Hello World';
		await expect(users[0].GreetingsRegistry.setMessage(testMessage))
			.to.emit(GreetingsRegistry, 'MessageChanged')
			.withArgs(users[0].address, testMessage);
	});
});
