---
name: angular-library
description: Guide for creating, building, and publishing Angular libraries. Trigger when working with ng-packagr, secondary entry points, public API surface, schematics, or publishing to npm.
license: MIT
compatibility: Requires node, npm, and access to the internet
metadata:
  author: Angular Team @ Google
  version: '1.0'
---

# Angular Library Guidelines

1. Always analyze the Angular version of the workspace before providing guidance, as library APIs and tooling may differ between versions.

2. Angular libraries are built with **ng-packagr** via the Angular CLI. Follow the Angular Package Format (APF) to ensure compatibility with downstream consumers.

3. After generating or modifying library code, run `ng build <library-name>` to confirm there are no build errors before proceeding.

4. Libraries must never import from the consuming application — they must be self-contained.

## Creating a New Library

When creating a new Angular library inside a workspace, consult the following reference:

- **Creating a Library**: Generating the library, workspace structure, and `ng-package.json`. Read [creating-library.md](references/creating-library.md)

## Public API Surface

Managing what consumers can import from your library is critical. Consult:

- **Public API**: Exporting symbols via `public-api.ts` and controlling the library's API surface. Read [public-api.md](references/public-api.md)

## Secondary Entry Points

When a library is large enough to benefit from tree-shakable sub-packages (e.g. `@my-lib/testing`), consult:

- **Secondary Entry Points**: Defining multiple entry points and their constraints. Read [secondary-entrypoints.md](references/secondary-entrypoints.md)

## Build and Packaging

For configuration of the build pipeline and output format:

- **ng-packagr**: Understanding `ng-package.json`, compilation output (ESM), and peer dependencies. Read [ng-packagr.md](references/ng-packagr.md)

## Publishing to npm

When preparing a library for distribution:

- **Publishing to npm**: Versioning, `peerDependencies`, `npm publish`, and automation. Read [publishing-npm.md](references/publishing-npm.md)

## Schematics

To provide `ng add` or `ng generate` commands for library consumers:

- **Schematics**: Adding Angular schematics to a library for code generation and automated setup. Read [schematics.md](references/schematics.md)

If you need deeper documentation, refer to the [official Angular Libraries guide](https://angular.dev/tools/libraries).
