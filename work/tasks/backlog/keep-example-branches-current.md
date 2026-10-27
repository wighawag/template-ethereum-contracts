---
title: Keep the examples/* branches current with main, and know when one breaks
slug: keep-example-branches-current
needsAnswers: true
blockedBy: []
---

## Why

The `examples/*` branches are worked examples, each a small change on top of `main` (1 to 6 commits of its own). They stay branches on purpose, to keep `main` simple. The rocketh documentation is about to be written from them (rocketh spec `documentation-information-architecture`, which links each guide to the comparison `compare/main...examples/<name>`), and a guide can only link to a branch that still works with the current template and the current rocketh packages.

Today they do not. Measured 2026-10-27 with GitHub's compare API:

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

## What

1. **Classify every branch** as either *live* (kept current with `main`) or *frozen* (a snapshot that must not move). The two `old-template-*` branches are frozen by nature: they show hardhat-deploy v1, and a migration, as they were. A frozen branch says so at the top of its README. A branch that is neither worth keeping current nor frozen is deleted.
2. **Bring every live branch up to date** with `main`, one at a time: rebase its own commits onto `main`, resolve by intent, and confirm it still demonstrates what it is for.
3. **Keep them current mechanically.** On every change to `main`, for each live branch: rebase onto `main`, run the checks, push with `--force-with-lease` if green; if the rebase conflicts or a check fails, push nothing and report the branch by name. Rebase (not merge) keeps each branch's own commits readable as "what this example adds", which is what the docs link to; force-pushing is acceptable because nothing builds on an example branch.
4. **Give each live branch a check that proves its point**, not only that it compiles. Baseline for all: install, compile, test, deploy to the in-memory network. Per branch, where possible, the thing it demonstrates (for `examples/safe-owned-upgrade`: the fork rehearsal against a local anvil, which needs no Sepolia).

## Acceptance

- Every `examples/*` branch is classified live or frozen; frozen ones say so in their README.
- Every live branch is 0 behind `main` and its checks pass.
- A change to `main` that breaks a live branch's rebase or checks is reported within one run, naming the branch, and leaves the branch untouched.
- The mechanism and the list of live branches are documented where a maintainer will find them.

## Open questions

1. **Where does the automation live?** A GitHub Actions workflow on `main` is the natural trigger (a push to `main`), but every file on `main` is copied into each project created from the template, so a template-maintenance workflow would travel to every user. Options:
   - a workflow on `main`, guarded with `if: github.repository == 'wighawag/template-ethereum-contracts'`, accepting that the file travels but does nothing elsewhere;
   - a script on an orphan `tooling` branch (as in jolly-roger), run by hand after merging into `main`, accepting that it depends on someone remembering;
   - a scheduled or dispatched job in another repository (rocketh's docs CI, say), which pushes with a token, keeping the template clean at the cost of a cross-repository credential;
   - the existing template-tree tooling (offshoot-fanout), if it can treat branches of one repository as descendants of `main`.
2. **Which branches are live?** In particular `examples/ens-import` (129 behind) and `examples/npmFilesToBuild`: still worth keeping, or delete?
3. **Rebase-and-force-push, or merge `main` in?** Rebase keeps each example's change readable; merging avoids rewriting published history. The proposal above is rebase.
