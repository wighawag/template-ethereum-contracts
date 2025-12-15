import {extensions} from './deploy.js';
import type {Extensions, Accounts, Data} from './deploy.js'
import {setupEnvironment} from 'rocketh';
import {setupHardhatDeploy} from 'hardhat-deploy/helpers';

// useful for test and scripts, uses file-system
const {loadAndExecuteDeployments} = setupEnvironment<Extensions,Accounts,Data>(extensions);
const {loadEnvironmentFromHardhat} = setupHardhatDeploy<Extensions,Accounts,Data>(extensions)

export {loadEnvironmentFromHardhat, loadAndExecuteDeployments};



