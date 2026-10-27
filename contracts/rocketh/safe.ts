// ----------------------------------------------------------------------------
// The Safe that owns this project's proxies, per network
// ----------------------------------------------------------------------------
// A Safe is created through Safe's own factory (Safe v1.4.1, deployed at the same
// addresses on every chain Safe supports), with CREATE2. Its address is therefore
// known BEFORE it exists: it follows from the factory, the Safe implementation, the
// owners, the threshold and a salt. That is what lets `rocketh/config.ts` name it
// as an account (`admin`), which is what rocketh needs to hand its calls to you
// on a real run and to impersonate it on a fork, while `deploy/000_deploy_safe.ts`
// creates it the first time.
import {
	concat,
	encodeFunctionData,
	encodePacked,
	getContractAddress,
	keccak256,
	pad,
	parseAbi,
	zeroAddress,
} from 'viem';

export const SAFE_V1_4_1 = {
	factory: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
	singleton: '0x41675C099F32341bf84BFc5382aF534df5C7461a',
	fallbackHandler: '0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99',
	// what the factory's `proxyCreationCode()` returns; the deploy script checks it
	//  against the factory on chain before creating anything
	proxyCreationCode:
		'0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea264697066735822122003d1488ee65e08fa41e58e888a9865554c535f2c77126a82cb4c0f917f31441364736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564',
} as const;

export const SAFE_FACTORY_ABI = parseAbi([
	'function createProxyWithNonce(address _singleton, bytes initializer, uint256 saltNonce) returns (address proxy)',
	'function proxyCreationCode() pure returns (bytes)',
]);

export const SAFE_ABI = parseAbi([
	'function setup(address[] _owners, uint256 _threshold, address to, bytes data, address fallbackHandler, address paymentToken, uint256 payment, address paymentReceiver)',
	'function getOwners() view returns (address[])',
	'function getThreshold() view returns (uint256)',
]);

export type SafeSpec = {
	readonly owners: readonly `0x${string}`[];
	readonly threshold: bigint;
	readonly saltNonce: bigint;
};

/** The Safe for each network that has one. A network missing here has no Safe. */
export const safes: {readonly [network: string]: SafeSpec} = {
	sepolia: {
		// account 1 of the project mnemonic (the `admin` account on every other network):
		//  the key that approves the Safe's transactions in the Safe app
		owners: ['0xE53cd71271AcAdbeb0f64d9c8C62bBdDc8cA9e66'],
		threshold: 1n,
		saltNonce: 0n,
	},
};

/** The calldata of `setup`, which the factory calls on the new Safe. */
export function safeInitializer(spec: SafeSpec): `0x${string}` {
	return encodeFunctionData({
		abi: SAFE_ABI,
		functionName: 'setup',
		args: [
			spec.owners,
			spec.threshold,
			zeroAddress,
			'0x',
			SAFE_V1_4_1.fallbackHandler,
			zeroAddress,
			0n,
			zeroAddress,
		],
	});
}

/** Where `createProxyWithNonce` puts this Safe, computed exactly as the factory does. */
export function predictSafeAddress(spec: SafeSpec): `0x${string}` {
	const salt = keccak256(
		encodePacked(
			['bytes32', 'uint256'],
			[keccak256(safeInitializer(spec)), spec.saltNonce],
		),
	);
	return getContractAddress({
		opcode: 'CREATE2',
		from: SAFE_V1_4_1.factory,
		salt,
		bytecode: concat([
			SAFE_V1_4_1.proxyCreationCode,
			pad(SAFE_V1_4_1.singleton),
		]),
	});
}
