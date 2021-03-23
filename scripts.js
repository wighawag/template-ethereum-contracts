#!/usr/bin/env node
'use strict';
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const {spawn} = require('child_process');
require('dotenv').config();

const rawArgs = process.argv.slice(2);

function parseArgs(numFixedArgs, expectedOptions) {
  const fixedArgs = [];
  const options = {};
  const extra = [];
  const alreadyCounted = {};
  for (let i = 0; i < rawArgs.length; i++) {
    const rawArg = rawArgs[i];
    if (rawArg.startsWith('--')) {
      const optionName = rawArg.slice(2);
      const optionDetected = expectedOptions[optionName];
      if (!alreadyCounted[optionName] && optionDetected) {
        alreadyCounted[optionName] = true;
        if (optionDetected === 'boolean') {
          options[optionName] = true;
        } else {
          i++;
          options[optionName] = rawArgs[i];
        }
      } else {
        if (fixedArgs.length < numFixedArgs) {
          throw new Error(
            `expected ${numFixedArgs} fied agrs, got only ${fixedCounter}`
          );
        } else {
          extra.push(rawArg);
        }
      }
    } else {
      if (fixedArgs.length < numFixedArgs) {
        fixedArgs.push(rawArg);
      } else {
        for (const opt of Object.keys(expectedOptions)) {
          alreadyCounted[opt] = true;
        }
        extra.push(rawArg);
      }
    }
  }
  return {options, extra, fixedArgs};
}

function execute(command) {
  return new Promise((resolve, reject) => {
    const onExit = (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    };
    spawn(command.split(' ')[0], command.split(' ').slice(1), {
      stdio: 'inherit',
      shell: true,
    }).on('exit', onExit);
  });
}

(async () => {
  const firstArg = rawArgs[0];
  if (firstArg === 'run') {
    const {fixedArgs, extra} = parseArgs(3, {});
    await execute(
      `cross-env HARDHAT_NETWORK=${fixedArgs[1]} ts-node --files ${
        fixedArgs[2]
      } ${extra.join(' ')}`
    );
  } else if (firstArg === 'deploy') {
    const {fixedArgs, extra} = parseArgs(2, {});
    await execute(
      `hardhat --network ${fixedArgs[1]} deploy ${extra.join(' ')}`
    );
  } else if (firstArg === 'export') {
    const {fixedArgs} = parseArgs(3, {});
    await execute(
      `hardhat --network ${fixedArgs[1]} export --export ${fixedArgs[2]}`
    );
  } else if (firstArg === 'fork:run') {
    const {fixedArgs, options, extra} = parseArgs(3, {
      deploy: 'boolean',
      blockNumber: 'string',
      'no-impersonation': 'boolean',
    });
    await execute(
      `cross-env ${
        options.deploy ? 'HARDHAT_DEPLOY_FIXTURE=true' : ''
      } HARDHAT_DEPLOY_ACCOUNTS_NETWORK=${fixedArgs[1]} HARDHAT_FORK=${
        fixedArgs[1]
      } ${
        options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''
      } ${
        options['no-impersonation']
          ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true`
          : ''
      } ts-node --files ${fixedArgs[2]} ${extra.join(' ')}`
    );
  } else if (firstArg === 'fork:deploy') {
    const {fixedArgs, options, extra} = parseArgs(2, {
      blockNumber: 'string',
      'no-impersonation': 'boolean',
    });
    await execute(
      `cross-env HARDHAT_DEPLOY_ACCOUNTS_NETWORK=${fixedArgs[1]} HARDHAT_FORK=${
        fixedArgs[1]
      } ${
        options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''
      } ${
        options['no-impersonation']
          ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true`
          : ''
      } hardhat deploy ${extra.join(' ')}`
    );
  } else if (firstArg === 'fork:test') {
    const {fixedArgs, options, extra} = parseArgs(2, {
      blockNumber: 'string',
      'no-impersonation': 'boolean',
    });
    await execute(
      `cross-env HARDHAT_DEPLOY_ACCOUNTS_NETWORK=${fixedArgs[1]} HARDHAT_FORK=${
        fixedArgs[1]
      } ${
        options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''
      } ${
        options['no-impersonation']
          ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true`
          : ''
      } HARDHAT_DEPLOY_FIXTURE=true HARDHAT_COMPILE=true mocha --bail --recursive test ${extra.join(
        ' '
      )}`
    );
  } else if (firstArg === 'fork:dev') {
    const {fixedArgs, options, extra} = parseArgs(2, {
      'no-impersonation': 'boolean',
    });
    await execute(
      `cross-env HARDHAT_DEPLOY_ACCOUNTS_NETWORK=${fixedArgs[1]} HARDHAT_FORK=${
        fixedArgs[1]
      } ${
        options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''
      } ${
        options['no-impersonation']
          ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true`
          : ''
      } hardhat node --watch --export contractsInfo.json ${extra.join(' ')}`
    );
  }
})();
