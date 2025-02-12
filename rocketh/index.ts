import type {HardhatPlugin} from '@ignored/hardhat-vnext/types/plugins';
import {task} from '@ignored/hardhat-vnext/config';

import './type-extensions.js';

const hardhatPlugin: HardhatPlugin = {
	id: 'hardhat-rocketh',
	tasks: [
		task('deploy', 'Deploy contracts')
			// .addFlag('skipGasReport', 'if set, skip gas report')
			.addFlag({name: 'skipPrompts', description: 'if set, skip any prompts'})
			.addFlag({name: 'saveDeployments', description: 'if set, save deployments'})
			.setAction(import.meta.resolve('./tasks/deploy.js'))
			.build(),
		task('compile-generate', 'compile contracts')
			.setAction(import.meta.resolve('./tasks/compile.js'))
			.build(),
	],
	npmPackage: '@ignored/hardhat-vnext-viem',
};

export default hardhatPlugin;
