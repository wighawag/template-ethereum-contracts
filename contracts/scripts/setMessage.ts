import {deployments, getUnnamedAccounts} from 'hardhat';
const {execute} = deployments;
// example script

const args = process.argv.slice(2);
const account = args[0];
const message = args[1];

async function main() {
	const accountAddress = isNaN(parseInt(account)) ? account : (await getUnnamedAccounts())[parseInt(account)];

	await execute('GreetingsRegistry', {from: accountAddress, log: true}, 'setMessage', message || 'hello');
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
