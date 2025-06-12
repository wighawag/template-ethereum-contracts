// script used to fund account from a geth coinbase account (geth --dev)
import {ethers, network} from 'hardhat';
import {BigNumber, providers} from 'ethers';

const {JsonRpcProvider} = providers;

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
	const accounts = await ethers.provider.listAccounts();
	let accountsToFund = accounts;
	if (coinbase === accounts[0]) {
		accountsToFund = accounts.slice(1);
	}

	const coinbaseBalance = await ethers.provider.getBalance(coinbase);
	const nonce = await ethers.provider.getTransactionCount(coinbase);
	const maxAmount = BigNumber.from('10000000000000000000');
	let amount = coinbaseBalance.div(accountsToFund.length);
	if (amount.gt(maxAmount)) {
		amount = maxAmount;
	}

	if (coinbaseBalance.gt(0)) {
		const rawProvider = new JsonRpcProvider(network.config.url);
		const coinbaseSigner = rawProvider.getSigner(coinbase);
		const txs: providers.TransactionResponse[] = [];
		for (let i = 0; i < accountsToFund.length; i++) {
			const to = accountsToFund[i];
			const tx = await coinbaseSigner.sendTransaction({
				to,
				value: amount.sub(21000).toHexString(),
				nonce: BigNumber.from(nonce + i).toHexString(),
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
