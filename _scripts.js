#!/usr/bin/env node
'use strict';
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const {spawn} = require('child_process');
const path = require('path');
require('dotenv').config();

const commandlineArgs = process.argv.slice(2);

function parseArgs(rawArgs, numFixedArgs, expectedOptions) {
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
          throw new Error(`expected ${numFixedArgs} fixed args, got only ${fixedArgs.length}`);
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

async function performAction(rawArgs) {
  const firstArg = rawArgs[0];
  const args = rawArgs.slice(1);
  if (firstArg === 'run') {
    const {fixedArgs, extra} = parseArgs(args, 2, {});
    let filepath = fixedArgs[1];
    const folder = path.basename(__dirname);
    if (filepath.startsWith(folder + '/') || filepath.startsWith(folder + '\\')) {
      filepath = filepath.slice(folder.length + 1);
    }
    await execute(
      `cross-env HARDHAT_DEPLOY_LOG=true HARDHAT_NETWORK=${fixedArgs[0]} ts-node --files ${filepath} ${extra.join(' ')}`
    );
  } else if (firstArg === 'deploy') {
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    await execute(`hardhat --network ${fixedArgs[0]} deploy --report-gas ${extra.join(' ')}`);
  } else if (firstArg === 'verify') {
    const {fixedArgs, extra} = parseArgs(args, 1, {});
    const network = fixedArgs[0];
    if (!network) {
      console.error(`need to specify the network as first argument`);
      return;
    }
    await execute(`hardhat --network ${network} etherscan-verify ${extra.join(' ')}`);
  } else if (firstArg === 'export') {
    const {fixedArgs} = parseArgs(args, 2, {});
    await execute(`hardhat --network ${fixedArgs[0]} export --export ${fixedArgs[1]}`);
  } else if (firstArg === 'fork:run') {
    const {fixedArgs, options, extra} = parseArgs(args, 2, {
      deploy: 'boolean',
      blockNumber: 'string',
      'no-impersonation': 'boolean',
    });
    let filepath = fixedArgs[1];
    const folder = path.basename(__dirname);
    if (filepath.startsWith(folder + '/') || filepath.startsWith(folder + '\\')) {
      filepath = filepath.slice(folder.length + 1);
    }
    await execute(
      `cross-env ${options.deploy ? 'HARDHAT_DEPLOY_FIXTURE=true' : ''} HARDHAT_DEPLOY_LOG=true HARDHAT_FORK=${
        fixedArgs[0]
      } ${options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''} ${
        options['no-impersonation'] ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true` : ''
      } ts-node --files ${filepath} ${extra.join(' ')}`
    );
  } else if (firstArg === 'fork:deploy') {
    const {fixedArgs, options, extra} = parseArgs(args, 1, {
      blockNumber: 'string',
      'no-impersonation': 'boolean',
    });
    await execute(
      `cross-env HARDHAT_FORK=${fixedArgs[0]} ${
        options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''
      } ${
        options['no-impersonation'] ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true` : ''
      } hardhat deploy --report-gas ${extra.join(' ')}`
    );
  } else if (firstArg === 'fork:node') {
    const {fixedArgs, options, extra} = parseArgs(args, 1, {
      blockNumber: 'string',
      'no-impersonation': 'boolean',
    });
    await execute(
      `cross-env HARDHAT_FORK=${fixedArgs[0]} ${
        options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''
      } ${
        options['no-impersonation'] ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true` : ''
      } hardhat node --hostname 0.0.0.0 ${extra.join(' ')}`
    );
  } else if (firstArg === 'fork:test') {
    const {fixedArgs, options, extra} = parseArgs(args, 1, {
      blockNumber: 'string',
      'no-impersonation': 'boolean',
    });
    await execute(
      `cross-env HARDHAT_FORK=${fixedArgs[0]} ${
        options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''
      } ${
        options['no-impersonation'] ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true` : ''
      } HARDHAT_DEPLOY_FIXTURE=true HARDHAT_COMPILE=true mocha --bail --recursive test ${extra.join(' ')}`
    );
  } else if (firstArg === 'fork:dev') {
    const {fixedArgs, options, extra} = parseArgs(args, 1, {
      blockNumber: 'string',
      'no-impersonation': 'boolean',
    });
    await execute(
      `cross-env HARDHAT_FORK=${fixedArgs[0]} ${
        options.blockNumber ? `HARDHAT_FORK_NUMBER=${options.blockNumber}` : ''
      } ${
        options['no-impersonation'] ? `HARDHAT_DEPLOY_NO_IMPERSONATION=true` : ''
      } hardhat node --hostname 0.0.0.0 --watch --export contractsInfo.json ${extra.join(' ')}`
    );
  } else if (firstArg === 'tenderly:push') {
    const {fixedArgs} = parseArgs(args, 1, {});
    await execute(`hardhat --network ${fixedArgs[0]} tenderly:push`);
  }
}

performAction(commandlineArgs);
