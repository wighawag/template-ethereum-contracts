// ----------------------------------------------------------------------------
// Typed Config
// ----------------------------------------------------------------------------
import type {
	EnhancedEnvironment,
	UnknownDeployments,
	UserConfig,
} from 'rocketh/types';

// this one provide a protocol supporting private key as account
import {privateKey} from '@rocketh/signer';

// The Safe that owns the GreetingsRegistry proxy on sepolia, created by
//  `deploy/000_deploy_safe.ts`. Its address is computed from its parameters
//  (`rocketh/safe.ts`), so it can be named here before it exists. rocketh holds no key for
//  it: on a real run its calls (the upgrade) are handed to you to execute in the Safe app,
//  and a fork rehearsal impersonates it so the whole upgrade runs.
import {predictSafeAddress, safes} from './safe.js';
const SEPOLIA_SAFE = predictSafeAddress(safes.sepolia);

// we define our config and export it as "config"
export const config = {
	accounts: {
		deployer: {
			default: 0,
		},
		admin: {
			default: 1,
			sepolia: SEPOLIA_SAFE,
		},
	},
	environments: {
		localhost: {
			chain: 31337,
			overrides: {
				autoMine: true,
			},
		},
		// what a fork of `sepolia` is a fork OF. anvil reports the forked chain's id by itself,
		//  but a hardhat fork (`HARDHAT_FORK=sepolia`) reports 31337 and needs this line.
		sepolia: {
			chain: 11155111,
			whenForked: {
				// On a fork the impersonated Safe sends its own calls, so it would pay their gas,
				//  which it never does for real and usually cannot (a Safe holds no ETH). rocketh
				//  lends it the ETH for each transaction and takes it back once mined.
				fundImpersonatedAccounts: true,
			},
		},
	},
	data: {},
	signerProtocols: {
		privateKey,
	},
} as const satisfies UserConfig;

// then we import each extensions we are interested in using in our deploy script or elsewhere

// this one provide a deploy function
import * as deployExtension from '@rocketh/deploy';
// this one provide read,execute functions
import * as readExecuteExtension from '@rocketh/read-execute';
// this one provide a deployViaProxy function that let you declaratively
//  deploy proxy based contracts
import * as deployProxyExtension from '@rocketh/proxy';
// this one provide a viem handle to clients and contracts
import * as viemExtension from '@rocketh/viem';

// and export them as a unified object
const extensions = {
	...deployExtension,
	...readExecuteExtension,
	...deployProxyExtension,
	...viemExtension,
};
export {extensions};

// then we also export the types that our config ehibit so other can use it

type Extensions = typeof extensions;
type Accounts = typeof config.accounts;
type Data = typeof config.data;
type Environment = EnhancedEnvironment<
	Accounts,
	Data,
	UnknownDeployments,
	Extensions
>;

export type {Extensions, Accounts, Data, Environment};
