# Ethereum Smart Contract Development Template

A production-ready template for developing EVM smart contracts using [Hardhat v3](https://hardhat.org/) and [hardhat-deploy v2](https://github.com/wighawag/hardhat-deploy) with the [rocketh](https://github.com/wighawag/rocketh) deployment system.

## Why This Template?

### hardhat-deploy + rocketh vs Ignition

While Hardhat's official [Ignition](https://hardhat.org/ignition) plugin offers a robust deployment system, it comes with a rigid DSL that limits flexibility. This template uses **hardhat-deploy + rocketh** which provides:

- **Hot Contract Replacement (HCR)**: The equivalent of HMR (Hot Module Replacement) for smart contracts. Edit your contracts and see changes live while developing your app or game. This uses proxy patterns with a set of conventions to make it work seamlessly.
- **Intuitive Deployment Scripts**: Write deployment logic in plain TypeScript.
- **Flexible Proxy Patterns**: Declarative proxy deployment with `deployViaProxy` for upgradeable contracts.
- **Universal Deploy Scripts**: Thanks to rocketh, the deploy script can run in any environment, nide, browser, etc...

### Monorepo Structure

This template is organized as a monorepo, making it easy to:

- Add a web frontend in a separate `web/` folder
- Import contract artifacts, ABIs, and types from the `contracts` package
- Share deployment information across packages
- Publish contracts as an npm package for external consumption

## Project Structure

```
.
├── contracts/                    # Smart contracts package
│   ├── src/                      # Solidity source files
│   ├── deploy/                   # Deployment scripts
│   ├── deployments/              # Deployment artifacts per network
│   ├── generated/                # Auto-generated artifacts and ABIs
│   ├── rocketh/                  # Rocketh configuration
│   │   ├── config.ts             # Account & extension configuration
│   │   ├── deploy.ts             # Deploy script setup
│   │   └── environment.ts        # Environment setup for tests/scripts
│   ├── scripts/                  # Utility scripts
│   └── test/                     # TypeScript tests
├── package.json                  # Root monorepo configuration
└── pnpm-workspace.yaml           # PNPM workspace definition
```

## Initial Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)

### Installation

```bash
pnpm i
```

We also recommend installing [Zellij](https://zellij.dev/) for an optimal development experience with `pnpm start`.

## Usage

### Compile Contracts

```bash
pnpm contracts:compile
```

This runs both Solidity and TypeScript compilation.

### Watch Mode (Auto-Rebuild)

Run in a separate terminal for automatic recompilation on changes:

> async: `run this in a separate terminal`

```bash
pnpm contracts:compile:watch
```

### Run Tests

```bash
pnpm contracts:test
```

This runs both:

- **Solidity tests** (forge-style, using `forge-std`)
- **TypeScript tests** (using Node.js test runner with `earl` assertions)

### Local Development

Start a local Ethereum node:

> async: `run this in a separate terminal`

```bash
pnpm contracts:local_node
```

Deploy to localhost:

```bash
pnpm contracts:deploy localhost --skip-prompts
```

### Deploy to Networks

1. Configure your environment variables in `.env.local`:

```bash skip
MNEMONIC_<network>="your mnemonic phrase"
ETHERSCAN_API_KEY=<api-key>  # For verification
```

Or use Hardhat's secret store for sensitive data.

2. Deploy:

```bash skip
pnpm contracts:deploy <network>
```

### Execute Scripts

Run scripts against a deployed contract:

```bash skip
pnpm contracts:execute <network> scripts/setMessage.ts "hello"
```

Or execute in a forked environment:

```bash skip
pnpm contracts:fork:execute <network> scripts/setMessage.ts "Hello world"
```

### Verify Contracts

```bash skip
pnpm contracts:verify <network>
```

## Zellij Development Environment

[Zellij](https://zellij.dev/) is a terminal multiplexer (like tmux) with a preconfigured layout for this template.

Start the full development environment:

```bash skip
pnpm start
```

This launches:

- A local Ethereum node
- Auto-compilation on file changes
- Auto-deployment on changes
- Auto-testing on changes
- An interactive shell for running scripts

## Configuration

### Named Accounts

Configure accounts in [`contracts/rocketh/config.ts`](contracts/rocketh/config.ts):

```typescript skip
export const config = {
  accounts: {
    deployer: { default: 0 }, // First account from mnemonic
    admin: { default: 1 }, // Second account
  },
  // ...
} as const satisfies UserConfig;
```

### Network Configuration

Networks are configured in [`contracts/hardhat.config.ts`](contracts/hardhat.config.ts) using helper functions:

- `addNetworksFromEnv()`: Auto-configure networks from `ETH_NODE_URI_*` environment variables
- `addNetworksFromKnownList()`: Add configurations for well-known networks
- `addForkConfiguration()`: Enable forking mode via `HARDHAT_FORK` env var

### Rocketh Extensions

Extensions provide deployment functionality. Configure in [`contracts/rocketh/config.ts`](contracts/rocketh/config.ts):

```typescript skip
import * as deployExtension from "@rocketh/deploy";
import * as deployProxyExtension from "@rocketh/proxy";
import * as readExecuteExtension from "@rocketh/read-execute";
import * as viemExtension from "@rocketh/viem";

const extensions = {
  ...deployExtension, // Basic deploy function
  ...readExecuteExtension, // read/execute helpers
  ...deployProxyExtension, // deployViaProxy for upgradeable contracts
  ...viemExtension, // viem client integration
};
```

## Writing Deploy Scripts

Deploy scripts are located in `contracts/deploy/` and are executed in order (prefixed with numbers):

```typescript skip
import { deployScript, artifacts } from "../rocketh/deploy.js";

export default deployScript(
  async (env) => {
    const { deployer, admin } = env.namedAccounts;

    // Deploy an upgradeable contract
    const deployment = await env.deployViaProxy(
      "GreetingsRegistry",
      {
        account: deployer,
        artifact: artifacts.GreetingsRegistry,
        args: ["prefix:"],
      },
      {
        owner: admin,
        linkedData: {
          /* metadata stored with deployment */
        },
      },
    );

    // Interact with the deployed contract
    const contract = env.viem.getContract(deployment);
    const message = await contract.read.messages([deployer]);
  },
  { tags: ["GreetingsRegistry"] },
);
```

## Writing Tests

### TypeScript Tests

Located in `contracts/test/`, using Node.js test runner and `earl` assertions:

```typescript skip
import { expect } from "earl";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { setupFixtures } from "./utils/index.js";

const { provider, networkHelpers } = await network.connect();
const { deployAll } = setupFixtures(provider);

describe("GreetingsRegistry", function () {
  it("should set and retrieve messages", async function () {
    const { env, GreetingsRegistry, unnamedAccounts } =
      await networkHelpers.loadFixture(deployAll);

    const greeter = unnamedAccounts[0];
    await env.execute(GreetingsRegistry, {
      functionName: "setMessage",
      args: ["hello"],
      account: greeter,
    });

    const message = await env.read(GreetingsRegistry, {
      functionName: "messages",
      args: [greeter],
    });
    expect(message).toEqual("hello");
  });
});
```

### Solidity Tests

Located alongside contracts with `.t.sol` extension, using forge-std:

```solidity
import {Test} from "forge-std/Test.sol";
import {GreetingsRegistry} from "./GreetingsRegistry.sol";

contract GreetingsRegistryTest is Test {
    GreetingsRegistry internal registry;

    function setUp() public {
        registry = new GreetingsRegistry("");
    }

    function test_setMessageWorks() public {
        registry.setMessage("hello");
        assertEq(registry.messages(address(this)), "hello");
    }
}
```

## Linting

Solidity linting is configured with [slippy](https://github.com/astrodevs-labs/slippy):

```bash
pnpm contracts:lint
```

## Publishing & Consuming Contracts

### Package Exports

The contracts package exposes multiple entry points:

```json
{
  "exports": {
    "./deploy/*": "./dist/deploy/*",
    "./rocketh/*": "./dist/rocketh/*",
    "./artifacts/*": "./dist/generated/artifacts/*",
    "./abis/*": "./dist/generated/abis/*",
    "./deployments/*": "./deployments/*",
    "./src/*": "./src/*"
  }
}
```

### Using in Another Package

```typescript skip
// Import ABIs
import { Abi_GreetingsRegistry } from "template-ethereum-contracts/abis/GreetingsRegistry.js";

// Import deployment info
import GreetingsRegistry from "template-ethereum-contracts/deployments/sepolia/GreetingsRegistry.json";

// Import Solidity sources (for inheritance or verification)
// Reference: template-ethereum-contracts/src/GreetingsRegistry/GreetingsRegistry.sol
```

### Building for Publication

```bash
pnpm contracts:build
```

## Environment Variables

| Variable                 | Description                                   |
| ------------------------ | --------------------------------------------- |
| `ETH_NODE_URI_<network>` | RPC endpoint for the network                  |
| `MNEMONIC_<network>`     | Mnemonic for account derivation               |
| `MNEMONIC`               | Fallback mnemonic if network-specific not set |
| `ETHERSCAN_API_KEY`      | API key for contract verification             |

Set `SECRET` as the value to use Hardhat's secret store:

```bash skip
ETH_NODE_URI_mainnet=SECRET  # Uses configVariable('SECRET_ETH_NODE_URI_mainnet')
```

## Adding a Web Frontend

Since this is a monorepo, you can easily add a web frontend:

1. Create a `web/` directory with your frontend framework
2. Add it to `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - "contracts"
     - "web"
   ```
3. Import contracts in your frontend:

- ABIs
  ```typescript skip
  import { Abi_GreetingsRegistry } from "template-ethereum-contracts/abis/GreetingsRegistry.js";
  ```
- Artifacts

  ```typescript skip
  import { Artifact_GreetingsRegistry } from "template-ethereum-contracts/artifacts/GreetingsRegistry.js";
  ```

- Deployments

  ```typescript skip
  import GreetingsRegistry from "template-ethereum-contracts/deployments/sepolia/GreetingsRegistry.js";
  ```

- or event Deploy Scripts
  ```typescript skip
  import DeployScript from "template-ethereum-contracts/deploy/001_deploy_greetings_registry.js";
  ```

4. Use the export script to generate deployment info:
   ```bash skip
   pnpm contracts:export <network> --ts ../web/src/lib/deployments.ts
   ```

## License

MIT
