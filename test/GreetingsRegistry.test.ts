import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from 'hardhat';

describe('GreetingsRegistry', function () {
  it('should work', async function () {
    await deployments.fixture('GreetingsRegistry');
    const greetingsRegistryContract = await ethers.getContract(
      'GreetingsRegistry'
    );
    expect(greetingsRegistryContract.address).to.be.a('string');
  });

  it('should fails', async function () {
    await deployments.fixture('GreetingsRegistry');
    const greetingsRegistryContract = await ethers.getContract(
      'GreetingsRegistry'
    );
    expect(greetingsRegistryContract.fails('testing')).to.be.revertedWith(
      'fails'
    );
  });

  it('setMessage works', async function () {
    await deployments.fixture('GreetingsRegistry');
    const others = await getUnnamedAccounts();
    const greetingsRegistryContract = await ethers.getContract(
      'GreetingsRegistry',
      others[0]
    );
    const testMessage = 'Hello World';
    await expect(greetingsRegistryContract.setMessage(testMessage))
      .to.emit(greetingsRegistryContract, 'MessageChanged')
      .withArgs(others[0], testMessage);
  });
});
