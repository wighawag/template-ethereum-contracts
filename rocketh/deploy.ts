import {config} from './config.js';

const accounts = config.accounts;
const data = config.data;

// this one provide a deploy function
import * as deployExtension from '@rocketh/deploy';
// this one provide read,execute functions
import * as readExecuteExtension from '@rocketh/read-execute';
// this one provide a deployViaProxy function that let you declaratively
//  deploy proxy based contracts
import * as deployProxyExtension from '@rocketh/proxy';
// this one provide a viem handle to clients and contracts
import * as viemExtension from '@rocketh/viem';

const extensions = {
	...deployExtension,
	...readExecuteExtension,
	...deployProxyExtension,
	...viemExtension,
};

export {extensions};

type Extensions = typeof extensions;
type Accounts = typeof accounts;
type Data = typeof data;

export type {Extensions, Accounts, Data};

// ----------------------------------------------------------------------------
// we re-export the artifacts, so they are easily available from the alias
import * as artifacts from '../generated/artifacts/index.js';
export {artifacts};
// ----------------------------------------------------------------------------
// we create the rocketh functions we need by passing the extensions to the
//  setup function
import {setupDeployScripts} from 'rocketh';
const {deployScript} = setupDeployScripts<Extensions,Accounts,Data>(extensions);

export {deployScript};



