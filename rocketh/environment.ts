import {extensions} from './deploy.js';
import type {Extensions, Accounts, Data} from './deploy.js'
import {setupEnvironmentFromFiles} from '@rocketh/node';
import {setupHardhatDeploy} from 'hardhat-deploy/helpers';

// useful for test and scripts, uses file-system
const {loadAndExecuteDeploymentsFromFiles} = setupEnvironmentFromFiles<Extensions,Accounts,Data>(extensions);
const {loadEnvironmentFromHardhat} = setupHardhatDeploy<Extensions,Accounts,Data>(extensions)

export {loadEnvironmentFromHardhat, loadAndExecuteDeploymentsFromFiles};



