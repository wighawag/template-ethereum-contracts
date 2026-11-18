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
// this one provide withUnknownSignerPolicy, to choose for one call what happens when its `from`
//  is an account rocketh cannot sign for (a Safe or multisig that owns your contracts).
//  rocketh handles such a call itself, with or without this extension: from a terminal it
//  pauses, prints the transaction, and you paste back the hash once you executed it
//  (https://rocketh.dev/documentation/unknown-signers/#the-default-rocketh-asks-you-execute-the-run-continues);
//  unattended it defers, and a `guard` makes the re-run converge
//  (https://rocketh.dev/documentation/unknown-signers/#what-makes-the-re-run-converge);
//  and a fork rehearsal with --write-transactions gives you every Safe-owned step as one batch
//  (https://rocketh.dev/documentation/safe-owned-project/#4-rehearse-on-a-fork).
//  It also provides catchUnknownSigner, kept for scripts ported from hardhat-deploy v1
//  (https://rocketh.dev/hardhat-deploy/migration/#catch-unknown-signer).
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
