/// Typed Context
/// This file is used by deploy script to get access
/// to typed artifacts as well as account names

import artifacts from '../generated/artifacts';
import '@rocketh/signer';

export const context = {
	accounts: {
		deployer: {
			default: 0,
		},
	},
	artifacts,
} as const;
