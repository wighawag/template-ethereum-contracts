import {encodeFunctionData} from 'viem';
import {deployScript} from '../rocketh/deploy.js';
import {
	SAFE_FACTORY_ABI,
	SAFE_V1_4_1,
	predictSafeAddress,
	safeInitializer,
	safes,
} from '../rocketh/safe.js';

/**
 * Create the Safe that owns the project's proxies on this network, if it has one
 * (`rocketh/safe.ts`) and it does not exist yet.
 *
 * It is created through Safe's own factory, so it is a regular Safe that the Safe app
 * finds by its owner. Its address is known in advance, which is how `rocketh/config.ts`
 * already names it as the `admin` account; this script only makes it exist, and does
 * nothing once it does (on a re-run, or on a fork of a network where it was created).
 */
export default deployScript(
	async (env) => {
		const spec = safes[env.name];
		if (!spec) {
			return;
		}
		const address = predictSafeAddress(spec);

		const code = await env.network.provider.request({
			method: 'eth_getCode',
			params: [address, 'latest'],
		});
		if (code && code !== '0x') {
			return;
		}

		// The address above is computed from the factory's creation code; a factory that
		//  answers differently would put the Safe somewhere else than where config names it.
		const onChainCreationCode = await env.network.provider.request({
			method: 'eth_call',
			params: [
				{
					to: SAFE_V1_4_1.factory,
					data: encodeFunctionData({
						abi: SAFE_FACTORY_ABI,
						functionName: 'proxyCreationCode',
					}),
				},
				'latest',
			],
		});
		if (!onChainCreationCode.includes(SAFE_V1_4_1.proxyCreationCode.slice(2))) {
			throw new Error(
				`the Safe factory at ${SAFE_V1_4_1.factory} on ${env.name} is not Safe v1.4.1's, so the Safe would not be created at ${address}`,
			);
		}

		await env.tx(
			{
				account: env.namedAccounts.deployer,
				to: SAFE_V1_4_1.factory,
				data: encodeFunctionData({
					abi: SAFE_FACTORY_ABI,
					functionName: 'createProxyWithNonce',
					args: [SAFE_V1_4_1.singleton, safeInitializer(spec), spec.saltNonce],
				}),
			},
			{message: `  - Creating the Safe at ${address}: {hash}`},
		);

		const created = await env.network.provider.request({
			method: 'eth_getCode',
			params: [address, 'latest'],
		});
		if (!created || created === '0x') {
			throw new Error(`the Safe factory did not create the Safe at ${address}`);
		}
	},
	{tags: ['Safe', 'Safe_deploy']},
);
