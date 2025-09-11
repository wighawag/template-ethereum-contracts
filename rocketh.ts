// ------------------------------------------------------------------------------------------------
// Typed Config
// ------------------------------------------------------------------------------------------------
import type {UserConfig} from 'rocketh';

import {privateKey} from '@rocketh/signer'; // this one provide a protocol supporting private key as account

export const config = {
	networks: {
		hardhat: {
			tags: ['local', 'memory', 'testnet'],
		},
		localhost: {
			tags: ['local', 'testnet'],
		},
		sepolia: {
			tags: ['live', 'testner'],
		},
		default: {
			tags: ['live'],
		},
	},
	accounts: {
		deployer: {
			default: 0,
		},
		admin: {
			default: 1,
		},
	},
	data: {},
	signerProtocols: {
		privateKey,
	},
} as const satisfies UserConfig;

// ------------------------------------------------------------------------------------------------
// Imports and Re-exports
// ------------------------------------------------------------------------------------------------
// We regroup all what is needed for the deploy scripts
// so that they just need to import this file
// We also added an alias (#rocketh) in package.json's imports
// so they just need to do `import {deployScript, artifacts} from '#rocketh';`
// and this work anywhere in the file hierarchy
// ------------------------------------------------------------------------------------------------
// we add here the module we need, so that they are available in the deploy scripts
import * as deployExtension from '@rocketh/deploy'; // this one provide a deploy function
import * as readExecuteExtension from '@rocketh/read-execute'; // this one provide read,execute functions
import * as deployProxyExtension from '@rocketh/proxy'; // this one provide a deployViaProxy function that let you declaratively deploy proxy based contracts
import * as viemExtension from '@rocketh/viem'; // this one provide a viem handle to clients and contracts
const extensions = {...deployExtension, ...readExecuteExtension, ...deployProxyExtension, ...viemExtension};
// ------------------------------------------------------------------------------------------------
// we re-export the artifacts, so they are easily available from the alias
import * as artifacts from './generated/artifacts/index.js';
export {artifacts};
// ------------------------------------------------------------------------------------------------
// we create the rocketh functions we need by passing the extensions to the setup function
import {setup} from 'rocketh';
const {deployScript, loadAndExecuteDeployments} = setup<typeof extensions, typeof config.accounts, typeof config.data>(
	extensions,
);
// ------------------------------------------------------------------------------------------------
// we do the same for hardhat-deploy
import {setupHardhatDeploy} from 'hardhat-deploy/helpers';
const {loadEnvironmentFromHardhat} = setupHardhatDeploy(extensions);
// ------------------------------------------------------------------------------------------------
// finally we export them
// - loadAndExecuteDeployments can be used in tests to ensure deployed contracts are available there
// - deployScript is the function used to create deploy script, see deploy/ folder
// - loadEnvironmentFromHardhat can be used in scripts and reuse hardhat network handling without deploying the contracts
export {loadAndExecuteDeployments, deployScript, loadEnvironmentFromHardhat};
