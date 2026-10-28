---
title: Keep the examples/* branches current with main, and know when one breaks
slug: keep-example-branches-current
needsAnswers: true
blockedBy: []
---

## Why

The `examples/*` branches are worked examples, each a small change on top of `main` (1 to 6 commits of its own). They stay branches on purpose, to keep `main` simple. The rocketh documentation is about to be written from them (rocketh spec `documentation-information-architecture`, which links each guide to the comparison `compare/main...examples/<name>`), and a guide may only link to a branch that is kept current against `main` and checked, by a mechanism that lives in this repository and is tracked here, on `work` (the rule as the rocketh spec states it today; open question 1 asks whether a job elsewhere would do).

Measured 2026-10-27 with GitHub's compare API:

| Branch | Own commits | Behind `main` | Last commit |
| --- | --- | --- | --- |
| `examples/safe-owned-upgrade` | 5 | 0 | 2026-10-27 |
| `examples/old-template-for-hardhat-deploy-v1-comparison` | 1 | 39 | 2026-01 |
| `examples/npmFilesToBuild` | 1 | 90 | 2025-10 |
| `examples/proxy-no-constructor-but-initializer` | 2 | 90 | 2025-10 |
| `examples/deploy-export` | 6 | 109 | 2025-09 |
| `examples/deploy-import` | 3 | 109 | 2025-09 |
| `examples/hardhat-connection-access` | 1 | 120 | 2025-08 |
| `examples/ens-import` | 2 | 129 | 2025-05 |
| `examples/old-template-migration-to-v2-by-ai` | 6 | 195 | 2026-01 |

Nothing tells anyone when a branch falls behind or stops building, so they drift silently.

## Status (2026-10-28)

The six branches below have had `main` merged into them (`main` was 4 commits further on than in the table above, hence the higher counts), ported to the `contracts/` monorepo layout, reviewed, checked with install, compile, tests and an in-memory deploy, and merged. Each is 0 behind `main` as of 2026-10-28.

| Branch | Behind before | PR | What it demonstrates |
| --- | --- | --- | --- |
| `examples/proxy-no-constructor-but-initializer` | 94 | #25, #32 | `deployViaProxy` of a contract with no constructor: `execute: {methodName: 'initialize', args}`, guarded by `asProxyInitialiser` |
| `examples/npmFilesToBuild` | 94 | #26 | Hardhat's `solidity.npmFilesToBuild`: an artifact for an npm Solidity file nothing imports (OpenZeppelin `ERC1967Proxy`) |
| `examples/hardhat-connection-access` | 124 | #27 | `getHardhatConnection(env)` from `hardhat-deploy` in a deploy script, and passing `extra: {connection}` from a test fixture |
| `examples/deploy-export` | 113 | #28 | A contracts package that works once installed: what its compiled files import is declared (the `@rocketh/*` extensions as `dependencies`, `rocketh` and `viem` as `peerDependencies`; on `main` all are `devDependencies`), and `pnpm contracts:pack` |
| `examples/deploy-import` | 113 | #29 | Installing that package from its tarball (hoisting off) and running its deploy script, artifacts and ABIs as one's own |
| `examples/ens-import` | 133 | #30 | Deploying from the artifacts an npm package ships (ENS), with the metadata read from its build info. It was a wip that never ran |

Also live, maintained separately and not part of this update: `examples/safe-owned-upgrade`, 2 behind `main` on 2026-10-28 (`main`'s README link to the rocketh.dev pages, #23).

Frozen, untouched: `examples/old-template-for-hardhat-deploy-v1-comparison`, `examples/old-template-migration-to-v2-by-ai`.

## What

1. **Classify every branch** as *live* (kept current with `main`) or *frozen* (a snapshot that must not move). The two `old-template-*` branches are frozen; a frozen branch says so at the top of its README. A branch that is neither worth keeping current nor frozen is deleted.
2. **Bring every live branch up to date** by merging `main` into it, resolving by intent (done, see Status).
3. **Keep them current mechanically** (proposal below).
4. **Give each live branch a check that proves its point**, not only that it compiles. Baseline for all: install, compile, test, deploy to the in-memory network. Per branch, the thing it demonstrates.

### Merge, not rebase

Settled by how `examples/safe-owned-upgrade` is already maintained: `main` is merged in (`Merge main: ...` commits), so the example's own commits stay its own and published history is never rewritten. `compare/main...examples/<name>` still shows exactly what the example adds, since the merge base moves to `main`'s tip. So no force-push is needed.

### Proposed mechanism

A GitHub Actions job, run on every push to `main` (and by hand), that for each live branch merges `main` into a scratch branch, runs that branch's checks, and reports. It never pushes to an `examples/*` branch itself.

- **The list and the checks live on `work`**, in a manifest such as `work/examples.json`, one entry per live branch: its name, the commands that prove it, and anything it needs beside it. `examples/deploy-import` needs `examples/deploy-export` cloned next to it as `template-ethereum-contracts-deploy-export` and packed first (`pnpm contracts:pack`), then a plain `pnpm i` (a frozen install keeps a stale copy of the tarball); `examples/safe-owned-upgrade` would add the fork rehearsal against a local anvil once that runs without a Sepolia RPC. Adding or freezing a branch is then a change on `work`, not on `main`.
- **The trigger has to be a file on `main`**, because GitHub only runs `push` and `schedule` workflows from the branch that holds them, and `work` is not where `main`'s pushes land. Keep it a thin dispatcher: guarded with `if: github.repository == 'wighawag/template-ethereum-contracts'`, it checks out `work` and runs the manifest, so a project created from the template gets a file that does nothing. The alternative that keeps `main` clean is a weekly scheduled job in another repository (rocketh's docs CI), at the cost of a cross-repository token; it would not meet the rocketh spec's rule as written, which asks for a mechanism in this repository, so choosing it means changing that rule too.
- **Per branch**: `git merge --no-edit origin/main` on a scratch branch. A conflict is a failure, reported by name, with no attempt to resolve it. Otherwise run the manifest's commands (`pnpm i`, `pnpm contracts:build`, `pnpm test`, `pnpm contracts:deploy default`, plus the branch's own). Only in-memory networks or a node the job starts itself; never a real network.
- **Reporting**: green merges open (or update) a pull request `update/<name>` into that example branch, so a maintainer merges it in one click, the way #25 to #30 and #32 were made. A conflict or a failing check opens (or updates) one issue per branch, naming the branch, the step and the log, and closes it when the branch is green again. Auto-merging green PRs is a later option, once the checks are trusted.

Each part is a separate decision; the dispatcher on `main` needs the maintainer's approval before it exists.

## Acceptance

- Every `examples/*` branch is classified live or frozen; frozen ones say so in their README.
- Every live branch is 0 behind `main` and its checks pass.
- A change to `main` that breaks a live branch's merge or checks is reported within one run, naming the branch, and leaves the branch untouched.
- The mechanism and the list of live branches are documented where a maintainer will find them (here, and in the manifest).

## Open questions

1. **Where does the trigger live?** A guarded dispatcher on `main` (travels to every project made from the template, inert there) or a scheduled job elsewhere (clean `main`, cross-repository credential).
2. **Does the dependency fix belong on `main`?** `main`'s contracts package declares its runtime imports as `devDependencies`, so every project made from the template publishes a package that breaks once installed (`examples/deploy-export` shows the fix). If it lands on `main`, `examples/deploy-export` differs from `main` only by its name again, and `deploy-import` could consume a packed `main` instead.
3. **Which other branches stay live?** In particular `examples/ens-import` and `examples/npmFilesToBuild`, now that both run.

## Found while updating

- rocketh imports every file of a `scripts` folder. A package built with `tsc` (as `main` is: `declaration`, `sourceMap`) has `.d.ts` and `.js.map` files next to each deploy script, so `scripts: ['node_modules/<pkg>/dist/deploy', 'deploy']`, which rocketh's "Share contracts between projects" guide documents, fails with `ReferenceError: _default is not defined`. `examples/deploy-import` re-exports the script from a file of its own instead. Also, rocketh sorts all script paths together, so the order of the folders in `scripts` does not decide which runs first; `dependencies` does. Both are now a rocketh backlog task, `script-folders-load-only-scripts-in-listed-order` (wighawag/rocketh#230); once it ships, `examples/deploy-import` can list the package's folder in `scripts` instead of re-exporting the script.
- The repository's CI workflow cannot install `examples/deploy-import` on its own, since it links to a sibling checkout.
