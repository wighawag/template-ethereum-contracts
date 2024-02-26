// script used to fund account from a geth coinbase account (geth --dev)
import {TransactionResponse} from 'ethers';
import {JsonRpcProvider} from 'ethers';
import hre from 'hardhat';
const {ethers, network, getUnnamedAccounts} = hre;

function wait(numSec: number): Promise<void> {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, numSec * 1000);
	});
}

async function main() {
	console.log('funding from coinbase ...');
	let found;
	while (!found) {
		try {
			await ethers.provider.send('eth_chainId', []);
			found = true;
		} catch (e) {} // TODO timeout ?
		if (!found) {
			console.log(`retrying...`);
			await wait(1);
		}
	}

	if (!('url' in network.config)) {
		console.log('cannot run on in memory hardhat network.');
		return;
	}

	const coinbase = await ethers.provider.send('eth_coinbase', []);
	if (!coinbase) {
		console.log('no coinbase');
		return;
	}
	const accounts = await getUnnamedAccounts();
	let accountsToFund = accounts;
	if (coinbase === accounts[0]) {
		accountsToFund = accounts.slice(1);
	}

	const coinbaseBalance = await ethers.provider.getBalance(coinbase);
	const nonce = await ethers.provider.getTransactionCount(coinbase);
	const maxAmount = 10000000000000000000n;
	let amount = coinbaseBalance / BigInt(accountsToFund.length);
	if (amount > maxAmount) {
		amount = maxAmount;
	}

	if (coinbaseBalance > 0n) {
		const rawProvider = new JsonRpcProvider(network.config.url);
		const coinbaseSigner = await rawProvider.getSigner(coinbase);
		const txs: TransactionResponse[] = [];
		for (let i = 0; i < accountsToFund.length; i++) {
			const to = accountsToFund[i];
			const tx = await coinbaseSigner.sendTransaction({
				to,
				value: amount - 21000n,
				nonce: nonce + i,
			});
			console.log(`${to}: ${tx.hash}`);
			txs.push(tx);
		}
		await Promise.all(txs.map((tx) => tx.wait()));
	} else {
		console.log('coinbase has zero balance');
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
