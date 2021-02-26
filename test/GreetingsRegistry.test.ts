import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from 'hardhat';
import {GreetingsRegistry} from '../typechain';
import {setupUsers} from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('GreetingsRegistry');
  const contracts = {
    GreetingsRegistry: <GreetingsRegistry>(
      await ethers.getContract('GreetingsRegistry')
    ),
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
