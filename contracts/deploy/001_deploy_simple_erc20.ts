import {deployScript, artifacts} from '../rocketh/deploy.js';
import {parseEther} from 'viem';

export default deployScript(
	async (env) => {
		const {deployer, simpleERC20Beneficiary} = env.namedAccounts;

		await env.deploy('SimpleERC20', {
			artifact: artifacts.SimpleERC20,
			account: deployer,
			args: [simpleERC20Beneficiary, parseEther('1000000000')],
		});
	},
	{
		tags: ['SimpleERC20'],
	},
);