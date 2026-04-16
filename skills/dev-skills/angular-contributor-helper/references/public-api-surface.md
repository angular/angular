# Public API Surface

[Full source](https://github.com/angular/angular/blob/main/contributing-docs/public-api-surface.md)

## Supported Packages

Angular's SemVer, release schedule, and deprecation policy applies to:

`@angular/animations`, `@angular/common`, `@angular/core`, `@angular/elements`, `@angular/forms`, `@angular/platform-browser-dynamic`, `@angular/platform-browser`, `@angular/platform-server`, `@angular/router`, `@angular/service-worker`, `@angular/upgrade`

**Excluded**: `@angular/compiler` (considered private/internal). Only CLI usage of `@angular/compiler-cli` is covered, not direct API use.

## What's Considered Public API

- Symbols exported via the main entry point (e.g. `@angular/core`) and testing entry point (e.g. `@angular/core/testing`)
- Symbols exported via global namespace `ng`

## What's Excluded from Public API

- File/import paths other than `/`, `/testing`, and `/bundles/*`
- Constructors of injectable classes
- Members marked `private` or prefixed with `_`, `ɵ`, or `ɵɵ`
- Extending classes unless explicitly documented
- Generated compiler code
- `@angular/core/primitives` package

## Peer Dependencies

Peer dependencies (TypeScript, Zone.js, RxJS) are not part of the public API surface, but are included in SemVer policies. Updates that don't cause breaking changes for Angular applications may happen in minor releases. Breaking peer dependency updates must be deferred to major releases.

## Extending Angular Classes

All public API classes are `final`. Do not extend unless the API docs explicitly allow it. Extending unsupported classes is not supported since protected members and internal implementation may change outside major releases.

## Golden Files

Angular tracks public API status in golden files using the **public API guard**.

If you modify any public API, CI will fail. To accept the new golden file:

```shell
pnpm bazel run //packages/<modified_package>:<modified_package>_api.accept
```

Example: if you changed `@angular/core`'s public API:

```shell
pnpm bazel run //packages/core:core_api.accept
```
