# Checklist: adopting TypeScript Project References & Incremental Builds (Angular CLI workspaces)

Use this checklist to validate correctness, compatibility, and performance.

## 1) Repository hygiene

- [ ] `.tsbuildinfo` files are not committed.
- [ ] Chosen `tsBuildInfoFile` directories are ignored (e.g. `node_modules/.cache/tsbuildinfo`).
- [ ] Composite `outDir` outputs are ignored (e.g. `dist/tsc/**`).

## 2) tsconfig correctness

### Solution config (`tsconfig.json`)

- [ ] Uses `files: []` (prevents double compilation).
- [ ] Contains `references` to all desired leaf projects.
- [ ] Does not include source globs at the solution level.

### Composite projects (typically libraries)

For each referenced project:

- [ ] `compilerOptions.composite: true`.
- [ ] `compilerOptions.declaration: true` (required for referenced projects).
- [ ] `compilerOptions.declarationMap: true` (recommended for editor navigation).
- [ ] `include` (or `files`) fully covers implementation sources.
- [ ] Unique `outDir`.
- [ ] Unique `tsBuildInfoFile`.

### Incremental-only projects (typically apps)

- [ ] `compilerOptions.incremental: true`.
- [ ] `compilerOptions.tsBuildInfoFile` set to a stable path.
- [ ] `compilerOptions.noEmit: true` (unless you intentionally emit).

## 3) Dependency graph

- [ ] `references` form a DAG (no cycles).
- [ ] Every cross-project import is matched by a corresponding `references` edge.
- [ ] No “back edges” (e.g. `shared` importing from `feature`) unless explicitly allowed.

## 4) Command validation

Run these locally:

- [ ] `tsc -b --verbose` succeeds.
- [ ] `tsc -b -w` rebuilds quickly after editing a leaf library.
- [ ] `tsc -b --clean` cleans outputs (and a subsequent `tsc -b` rebuilds correctly).

## 5) Angular CLI compatibility

- [ ] `ng build` for the main app still succeeds.
- [ ] `ng test` still succeeds.
- [ ] `ng serve` works.
- [ ] If you have Angular libraries built via CLI/ng-packagr: packaging still works.

If any of these break, verify which tsconfig file Angular CLI is using in `angular.json` and ensure it still extends the correct base config.

## 6) IDE experience

- [ ] Go to definition crosses project boundaries sensibly.
- [ ] Rename across projects works.
- [ ] After a fresh clone, opening the repo does not show persistent “missing `.d.ts`” errors.
  - If it does, document a one-time `tsc -b` bootstrap build.

## 7) Performance checks

- [ ] Second run of `tsc -b` is faster than the first (incremental hit).
- [ ] Editing a leaf library triggers rebuild of a minimal set of downstream projects.
- [ ] Watch mode CPU stays reasonable.

Optional watch optimization:

- [ ] Consider `assumeChangesOnlyAffectDirectDependencies` if watch rebuilds are too slow (trade-off: may require occasional full build to surface all diagnostics).

## 8) Common failure signatures

### “File is not listed within the file list of project”

Likely cause:

- `composite: true` + incomplete `include`.

Fix:

- Ensure all sources are matched by `include` or listed in `files`.

### Rebuild loops / always out-of-date

Likely causes:

- unstable output paths
- shared `outDir`
- generated files being watched/compiled

Fix:

- unique `outDir` per project
- exclude generated output from inputs (`include` only `src/**`)

### Duplicate type definitions / mismatched imports

Likely causes:

- `paths` mapping bypasses project references
- mixing source imports and built output imports

Fix:

- align `paths` strategy with project boundaries
- prefer importing from source paths consistently and let TS handle `.d.ts` boundaries via references
