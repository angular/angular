# Implementation plan: TypeScript Project References & Incremental Builds (Angular CLI workspaces)

This document is an actionable rollout plan for adopting TypeScript **Project References** and **incremental** compilation in Angular CLI-style workspaces.

## Overview

### Success criteria

- Developers can keep using `ng build`, `ng test`, and `ng serve` as before.
- A new, fast TypeScript-only check is available (solution-level `tsc -b`).
- Libraries become explicit build units with a valid reference DAG.
- IDE navigation and refactors work reliably across projects.
- Incremental rebuilds are measurably faster (local dev; optionally CI with caching).

### Decisions to make up-front

1. **Workspace shape:** are projects arranged as `apps/` + `libs/`, or Angular CLI `projects/`?
2. **Which units are composite?**
   - Recommended: libraries composite, apps incremental+noEmit.
   - Optional: apps composite only if you truly want to build them via `tsc -b` outputs.
3. **Artifact locations:**
   - `outDir` for composite projects (recommend `dist/tsc/...`).
   - `tsBuildInfoFile` location (recommend `node_modules/.cache/tsbuildinfo/...`).
4. **Module boundaries:** do you enforce dependency direction (e.g. `shared` → `ui` → `feature`)?
5. **Path aliases (`compilerOptions.paths`) policy:** keep, refactor, or tighten.

## Rollout stages

### Stage 0 — Baseline and guardrails

1. Measure current times:
   - cold `ng build` (or most common build)
   - `ng test` (if significant)
   - editor load time (subjective is fine)
   - TypeScript-only check time (if you have one)
2. Add `.gitignore` rules for build caches you’ll introduce (e.g. `.tsbuildinfo` paths).

Acceptance:

- No functional changes yet; baseline established.

### Stage 1 — Add a shared base config and a solution entry point

1. Ensure there is a shared base `tsconfig.base.json` (or existing equivalent) used via `extends`.
2. Create a root solution `tsconfig.json`:
   - `files: []`
   - `references: [...]` to all project tsconfigs you want in the graph.

Acceptance:

- `tsc -b` at repo root discovers the graph (it may not build much until Stage 2).
- TypeScript server recognizes the solution structure.

### Stage 2 — Convert libraries to composite projects (core step)

Do this library-by-library.

For each library `libs/<name>` (or `projects/<name>`):

1. Create/adjust a dedicated lib config (e.g. `tsconfig.lib.json`) with:
   - `compilerOptions.composite: true`
   - `compilerOptions.declaration: true`
   - `compilerOptions.declarationMap: true`
   - unique `outDir`
   - unique `tsBuildInfoFile`
   - tight `include` (e.g. `src/**/*.ts`)
2. Add `references` to other libraries it imports.
3. Add a reference to this library config in the root solution `tsconfig.json`.

Acceptance:

- `tsc -b --verbose` builds the library and its dependencies in order.
- No composite errors about missing files.
- Output folders do not collide.

### Stage 3 — Add incremental app configs (optional but recommended)

For each application:

1. Enable incremental typechecking:
   - `compilerOptions.incremental: true`
   - `compilerOptions.tsBuildInfoFile: <stable path>`
2. Use `compilerOptions.noEmit: true` to avoid extra output artifacts.
3. Add `references` to the libraries the app consumes.

Acceptance:

- App typecheck via `tsc -p <app tsconfig>` is faster on subsequent runs.
- No changes required to `ng build`/`ng serve` configs.

### Stage 4 — Wire developer commands

Add documented commands (or package scripts) such as:

- `tsc -b` (solution build / typecheck)
- `tsc -b -w` (watch)
- `tsc -b --clean` (clean)

Acceptance:

- Developers can choose between Angular CLI build and TS-only checks.

### Stage 5 — CI integration and caching (optional)

1. Decide whether CI should run `tsc -b`:
   - If you want early/fast feedback on type errors: add it.
   - If Angular builds already cover your needs: keep it as developer tool only.
2. If running `tsc -b` in CI, cache the `.tsbuildinfo` directory.

Acceptance:

- CI remains stable and deterministic.

## Migration tips

- Start with a low-risk library (few dependents) to validate patterns.
- Use unique `outDir` per project from day one.
- Keep test configs (`tsconfig.spec.json`) separate and usually non-composite.
- If the repo already uses `paths`, avoid changing them in the first iteration; focus on correctness.

## Rollback plan

Project references are additive:

- You can remove `references` entries without changing existing compilation.
- You can remove `composite` configs and fall back to single-project compilation.

If you see instability:

- Temporarily stop using `tsc -b` in CI.
- Keep references for editor navigation only.

## Debugging checklist (quick)

- `tsc -b --verbose` to see build ordering and why projects rebuild.
- Ensure every composite project has correct `include`/`files`.
- Ensure no two projects share `outDir`.
- Ensure no cycles in `references`.
