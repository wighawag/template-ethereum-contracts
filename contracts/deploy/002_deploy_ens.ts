import {labelhash, namehash, zeroHash} from 'viem';
import {deployScript} from '../rocketh/deploy.js';
import {loadENSArtifact} from '../rocketh/ens.js';

// ENS's contracts are not compiled here: @ensdomains/ens-contracts ships the
// artifacts of its own build, which rocketh deploys like any other.
const ENSRegistry = loadENSArtifact(
	'contracts/registry/ENSRegistry.sol/ENSRegistry.json',
);
const ReverseRegistrar = loadENSArtifact(
	'contracts/reverseRegistrar/ReverseRegistrar.sol/ReverseRegistrar.json',
);
const GatewayProvider = loadENSArtifact(
	'contracts/ccipRead/GatewayProvider.sol/GatewayProvider.json',
);
const UniversalResolver = loadENSArtifact(
	'contracts/universalResolver/UniversalResolver.sol/UniversalResolver.json',
);

export default deployScript(
	async (env) => {
		const {deployer, admin} = env.namedAccounts;

		// A fresh ENS registry: the account that deploys it owns the root node.
		const registry = await env.deploy('ENSRegistry', {
			account: deployer,
			artifact: ENSRegistry,
		});

		// The UniversalResolver claims its own reverse record when it is
		// deployed, so `addr.reverse` must belong to a ReverseRegistrar first.
		const reverseRegistrar = await env.deploy('ReverseRegistrar', {
			account: deployer,
			artifact: ReverseRegistrar,
			args: [registry.address],
		});
		await setOwnerIfNeeded('reverse', deployer);
		await setOwnerIfNeeded('addr.reverse', reverseRegistrar.address);

		// The gateways the UniversalResolver uses for offchain (CCIP-Read)
		// lookups. 'x-batch-gateway:true' is the local batch gateway of ENSIP-21,
		// one of the two ENS itself sets on mainnet; nothing here is offchain.
		const batchGatewayProvider = await env.deploy('BatchGatewayProvider', {
			account: deployer,
			artifact: GatewayProvider,
			args: [admin, ['x-batch-gateway:true']],
		});

		const universalResolver = await env.deploy('UniversalResolver', {
			account: deployer,
			artifact: UniversalResolver,
			args: [admin, registry.address, batchGatewayProvider.address],
		});

		const registryUsed = await env.read(universalResolver, {
			functionName: 'registry',
		});
		console.log(`UniversalResolver reads ENS registry ${registryUsed}`);

		// gives `name` to `owner` through its parent, unless it already has it
		async function setOwnerIfNeeded(name: string, owner: `0x${string}`) {
			const [label, ...parent] = name.split('.');
			const currentOwner = (await env.read(registry, {
				functionName: 'owner',
				args: [namehash(name)],
			})) as string;
			if (currentOwner.toLowerCase() !== owner.toLowerCase()) {
				await env.execute(registry, {
					account: deployer,
					functionName: 'setSubnodeOwner',
					args: [
						parent.length > 0 ? namehash(parent.join('.')) : zeroHash,
						labelhash(label),
						owner,
					],
				});
			}
		}
	},
	{tags: ['ENS', 'ENS_deploy']},
);
