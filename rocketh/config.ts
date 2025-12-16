// ----------------------------------------------------------------------------
// Typed Config
// ----------------------------------------------------------------------------
import type {UserConfig} from 'rocketh/types';

// this one provide a protocol supporting private key as account
import {privateKey} from '@rocketh/signer';

export const config = {
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
