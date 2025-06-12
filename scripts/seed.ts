import {getUnnamedAccounts, ethers} from 'hardhat';

const messages = ['Hello', '你好', 'سلام', 'здравствуйте', 'Habari', 'Bonjour', 'नमस्ते'];

async function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
	const tx = await p;
	try {
		await ethers.provider.send('evm_mine', []); // speed up on local network
	} catch (e) {}
	return tx.wait();
}

async function main() {
	const others = await getUnnamedAccounts();
	for (let i = 0; i < messages.length; i++) {
		const sender = others[i];
		if (sender) {
			const greetingsRegistryContract = await ethers.getContract('GreetingsRegistry', sender);
			await waitFor(greetingsRegistryContract.setMessage(messages[i]));
		}
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
