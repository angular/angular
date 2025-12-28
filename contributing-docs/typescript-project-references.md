# TypeScript Project References & Incremental Builds (for Angular CLI workspaces)

This document explains how to use TypeScript **Project References** (`references`, `composite`, `tsc -b`) and **incremental builds** (`incremental`, `.tsbuildinfo`) in _Angular CLI-style_ workspaces (apps + libs).

> Note: The `angular/angular` repository itself is primarily built with Bazel. This doc is **general guidance** for Angular projects and workspaces (including internal monorepos) rather than prescribing changes to how Angular is built.

## Goals

- Speed up TypeScript typechecking in large workspaces.
- Improve IDE responsiveness and correctness across project boundaries.
- Enforce architectural layering (e.g. apps depend on libs; libs have explicit dependencies).
- Keep existing `ng build`, `ng test`, and other workflows working.

## Non-goals

- Replacing Angular CLI’s build pipeline.
- Using legacy per-file `/// <reference path="..." />` directives.

## Key concepts

### Project references (`references`)

A `tsconfig.json` can reference other TypeScript projects:

```jsonc
{
  "references": [{"path": "../shared"}, {"path": "../ui/tsconfig.lib.json"}],
}
```

When you reference a project:

- TypeScript treats referenced projects as a dependency graph.
- Imports from a referenced project typically use its **generated `.d.ts`** as the boundary.
- Build mode (`tsc -b`) can build dependencies in the correct order.

**Reference docs:**

- https://www.typescriptlang.org/docs/handbook/project-references.html

### `composite` (required for referenced projects)

Projects that are referenced **must** enable:

```jsonc
{
  "compilerOptions": {
    "composite": true,
  },
}
```

`composite: true` enforces constraints that allow TypeScript (and tools) to reason about build outputs:

- All implementation files must be covered by `include` or explicitly listed in `files`.
- `declaration` becomes required/expected (and defaults to `true`).
- `rootDir` defaults to the folder containing the `tsconfig` (if not set).

**Reference docs:**

- https://www.typescriptlang.org/tsconfig#composite

### Build mode (`tsc -b` / `tsc --build`)

`tsc -b` is a build orchestrator:

- Discovers referenced projects.
- Checks what’s out-of-date.
- Builds projects in dependency order.

Common commands:

```bash
# Build everything reachable from the solution config
tsc -b

# Watch mode for the solution
tsc -b -w

# Clean build outputs for referenced projects
tsc -b --clean

# Force rebuild
tsc -b --force
```

Important behavior:

- TypeScript does **not** automatically build referenced dependencies unless you use `--build`.
- In build mode, TypeScript effectively behaves as if `noEmitOnError` is enabled.

**Reference docs:**

- https://www.typescriptlang.org/docs/handbook/project-references.html#build-mode-for-typescript
- https://www.typescriptlang.org/docs/handbook/compiler-options.html

### Incremental compilation (`incremental`, `.tsbuildinfo`, `tsBuildInfoFile`)

`incremental: true` writes build graph metadata to `.tsbuildinfo` so subsequent runs can be faster.

```jsonc
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/.cache/tsbuildinfo/myproj.tsbuildinfo",
  },
}
```

Notes:

- `.tsbuildinfo` files are build cache artifacts and can be deleted.
- `incremental` defaults to `true` when `composite` is `true`.

**Reference docs:**

- https://www.typescriptlang.org/tsconfig#incremental
- https://www.typescriptlang.org/tsconfig#tsBuildInfoFile

### Editor performance knobs (large solutions)

TypeScript supports options that can help large multi-project repos:

- `disableReferencedProjectLoad`: don’t load all referenced projects immediately.
- `disableSolutionSearching`: opt out of solution-wide behaviors.
- `disableSourceOfProjectReferenceRedirect`: don’t prefer sources over `.d.ts` across boundaries.

These are advanced options and should be tested with your team’s editor workflows.

## Angular-specific considerations

### Angular compiler integration

Angular compilation is configured primarily through TypeScript `tsconfig.json` and `angularCompilerOptions`.
The `ngc` command (from `@angular/compiler-cli`) wraps TypeScript compilation.

Docs:

- https://angular.dev/reference/configs/angular-compiler-options

### Libraries vs applications

A pragmatic rule:

- **Libraries** are the best fit for **Project References** (`composite: true`), since they are naturally reusable build units and `.d.ts` boundaries make sense.
- **Applications** typically don’t need to emit `.d.ts` or JS via `tsc` because Angular CLI handles bundling. Apps can still use `incremental` + `noEmit` for fast typechecking.

### Publishable libraries

If a library is published independently, prefer Angular’s stable library output via:

```jsonc
{
  "angularCompilerOptions": {
    "compilationMode": "partial",
  },
}
```

(For monorepos where apps and libs are always built together with the same Angular version, `full` may be acceptable.)

## Recommended tsconfig layout (solution-style)

This pattern gives you a single entry point for `tsc -b` while keeping each project isolated.

### 1) Base config

Create or use a base file shared by all projects:

- `tsconfig.base.json` (or similar)

### 2) Root solution config

A solution config should typically **not compile files** directly. Instead, it only references subprojects:

```jsonc
// tsconfig.json (solution)
{
  "files": [],
  "references": [
    {"path": "./libs/shared/tsconfig.lib.json"},
    {"path": "./libs/ui/tsconfig.lib.json"},
    {"path": "./apps/web/tsconfig.app.json"},
  ],
}
```

Rationale:

- Avoids double-compilation.
- Gives `tsc -b` a single entry point.

### 3) Library config (composite)

```jsonc
// libs/ui/tsconfig.lib.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,

    "outDir": "../../dist/tsc/libs/ui",
    "tsBuildInfoFile": "../../node_modules/.cache/tsbuildinfo/libs-ui.tsbuildinfo",
  },
  "include": ["src/**/*.ts"],
  "references": [{"path": "../shared/tsconfig.lib.json"}],
}
```

Key requirements:

- Unique `outDir` per project.
- Explicit `include` (composite requires completeness).
- Stable `tsBuildInfoFile` path (recommended under `node_modules/.cache`).

### 4) App config (incremental + noEmit)

```jsonc
// apps/web/tsconfig.app.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "../../node_modules/.cache/tsbuildinfo/apps-web.tsbuildinfo",
    "noEmit": true,
  },
  "include": ["src/**/*.ts"],
  "references": [
    {"path": "../../libs/shared/tsconfig.lib.json"},
    {"path": "../../libs/ui/tsconfig.lib.json"},
  ],
  "angularCompilerOptions": {
    "strictTemplates": true,
  },
}
```

## Workflow integration

### Conservative adoption (recommended default)

- Keep Angular CLI commands as-is (`ng build`, `ng test`).
- Add TypeScript-only checks as extra commands:

```bash
# TypeScript solution build / typecheck
tsc -b

# Watch
tsc -b -w
```

This improves dev speed and IDE performance without forcing `ng` workflows to change.

### CI caching

If you want incremental wins in CI, cache the `.tsbuildinfo` directory (for example `node_modules/.cache/tsbuildinfo`).

## Common pitfalls

- **“File is not listed within the file list of project”** when enabling `composite`: fix `include`/`files`.
- **Output collisions**: each project needs its own `outDir`.
- **Cycles** in references: the graph must be a DAG.
- **IDE errors after fresh clone**: referenced projects may need a one-time `tsc -b` build if the editor doesn’t synthesize `.d.ts` in-memory.
- **Confusing `paths` mappings**: ensure `paths` doesn’t bypass intended dependency layering.

## Further reading

- TypeScript Project References: https://www.typescriptlang.org/docs/handbook/project-references.html
- TSConfig reference (`composite`, `incremental`, `tsBuildInfoFile`): https://www.typescriptlang.org/tsconfig
- Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options
