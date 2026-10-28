import {expect} from 'earl';
import {describe, it} from 'node:test';
import {network} from 'hardhat';
import {zeroHash} from 'viem';
import {setupFixtures} from './utils/index.js';

const {provider, networkHelpers} = await network.connect();
const {deployAll} = setupFixtures(provider);

describe('ENS, deployed from the artifacts of @ensdomains/ens-contracts', function () {
	it('gives the root node of the new registry to the deployer', async function () {
		const {env, namedAccounts} = await networkHelpers.loadFixture(deployAll);
		const owner = await env.read(env.get('ENSRegistry'), {
			functionName: 'owner',
			args: [zeroHash],
		});
		expect((owner as string).toLowerCase()).toEqual(
			namedAccounts.deployer.toLowerCase(),
		);
	});

	it('points the UniversalResolver at that registry', async function () {
		const {env} = await networkHelpers.loadFixture(deployAll);
		const registry = await env.read(env.get('UniversalResolver'), {
			functionName: 'registry',
		});
		expect((registry as string).toLowerCase()).toEqual(
			env.get('ENSRegistry').address.toLowerCase(),
		);
	});

	it('keeps the compiler metadata in the deployment record', async function () {
		const {env} = await networkHelpers.loadFixture(deployAll);
		const metadata = JSON.parse(env.get('UniversalResolver').metadata);
		expect(metadata.compiler.version).toInclude('0.8.26');
	});
});
