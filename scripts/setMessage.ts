import {ethers, getUnnamedAccounts} from 'hardhat';

// example script

const args = process.argv.slice(2);
const account = args[0];
const message = args[1];

async function main() {
  const accountAddress = isNaN(parseInt(account))
    ? account
    : (await getUnnamedAccounts())[parseInt(account)];

  console.log({accountAddress, message});
  const GreetingsRegistry = await ethers.getContract(
    'GreetingsRegistry',
    accountAddress
  );
  const tx = await GreetingsRegistry.setMessage(message || 'hello');
  console.log({tx: tx.hash});
  await tx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
