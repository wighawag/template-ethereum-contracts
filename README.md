# Boilerplate for ethereum solidity smart contract development

## INSTALL

```bash
yarn
```

## TEST

```bash
yarn test
```

## Github Setup

This include codechecks setup for gas report.
See guide here : https://github.com/cgewecke/hardhat-gas-reporter#continuous-integration

The repo code is setup for it. The only thing needed is setting up codecheks account and adding the repo to codechecks so you get a secret token

you ll need to set the github secret of the respective project added to codechecks.io. the secret name is: CC_SECRET (see .github/workflows/main.yml)

If you do not want gas report via codecheck you can remove `codechecks.yml` and `.github` and execute : `yarn remove @codechecks/client`
