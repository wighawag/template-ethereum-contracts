## How to use?

### Compile your contracts

```bash
pnpm compile
```

### Test your contracts

There is 2 flavors of test

1. Using hardhat

```bash
pnpm test
```

2. Using foundry

```bash
forge test
```

This assumes you have `forge` installed and that you added forge-std in via the following command

```bash
git clone --recursive https://github.com/foundry-rs/forge-std.git lib/forge-std
```

You can also add it as a submodule if you prefers

### watch for changes and rebuild automatically

```bash
pnpm watch_compile
```

### deploy your contract

- on localhost

  This assume you have a local node running : `pnpm local_node`

  ```bash
  pnpm run deploy localhost
  ```

- on a network of your choice

  Just make sure you have your .env.local setup, see [.env](.env)

  ```bash
  pnpm run deploy <network>
  ```

### execute scripts

The setup currently use hardhat run and so to pass argument we use env variables

```bash
MESSAGE="hello earth" pnpm hardhat --network localhost run scripts/setMessage.ts
```

```bash
ACCOUNT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 pnpm hardhat --network localhost run scripts/readMessage.ts
```

### zellij

[zellij](https://zellij.dev/) is a useful multiplexer (think tmux) for which we have included a [layout file](./zellij.kdl) to get started

Once installed simply run

```bash
pnpm start
```

And you'll have anvil running as well as watch process executing tests on changes

if you want to try zellij without install try this :

```bash
bash <(curl -L zellij.dev/launch) --layout zellij.kdl
```

In the shell in the upper pane, you can deploy your contract via

```bash
pnpm run deploy
```

## Initial Setup

You need to have these installed

- [nodejs](https://nodejs.org/en)

- [pnpm](https://pnpm.io/)

  ```bash
  npm i -g pnpm
  ```

Then you need to install the local dependencies with the following command:

```bash
pnpm i
```

We also recommend to install [zellij](https://zellij.dev/) to have your dev env setup in one go via `pnpm start`
