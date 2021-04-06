import {expect} from './chai-setup';
import {
  ethers,
  deployments,
  getUnnamedAccounts,
  getNamedAccounts,
} from 'hardhat';
import {IERC20} from '../typechain';
import {setupUser, setupUsers} from './utils';

const setup = deployments.createFixture(async () => {
  await deployments.fixture('SimpleERC20');
  const {simpleERC20Beneficiary} = await getNamedAccounts();
  const contracts = {
    SimpleERC20: <IERC20>await ethers.getContract('SimpleERC20'),
  };
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    simpleERC20Beneficiary: await setupUser(simpleERC20Beneficiary, contracts),
  };
});

describe('SimpleERC20', function () {
  it('transfer fails', async function () {
    const {users} = await setup();
    await expect(
      users[0].SimpleERC20.transfer(users[1].address, 1)
    ).to.be.revertedWith('NOT_ENOUGH_TOKENS');
  });

  it('transfer succeed', async function () {
    const {users, simpleERC20Beneficiary, SimpleERC20} = await setup();
    await simpleERC20Beneficiary.SimpleERC20.transfer(users[1].address, 1);

    await expect(
      simpleERC20Beneficiary.SimpleERC20.transfer(users[1].address, 1)
    )
      .to.emit(SimpleERC20, 'Transfer')
      .withArgs(simpleERC20Beneficiary.address, users[1].address, 1);
  });
});
