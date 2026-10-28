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

// we define our config and export it as "config"
export const config = {
	accounts: {
		deployer: {
			default: 0,
		},
		admin: {
			default: 1,
		},
	},
	environments: {
		localhost: {
			chain: 31337,
			overrides: {
				autoMine: true,
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
// this one provide catchUnknownSigner: wrap a call whose `from` rocketh cannot sign for
//  (a Safe or multisig that owns your contracts) and get the transaction back to execute
//  on it, instead of the run stopping there. See https://rocketh.dev/documentation/unknown-signers/
import * as unknownSignerExtension from '@rocketh/unknown-signer';

// and export them as a unified object
const extensions = {
	...deployExtension,
	...readExecuteExtension,
	...deployProxyExtension,
	...viemExtension,
	...unknownSignerExtension,
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
