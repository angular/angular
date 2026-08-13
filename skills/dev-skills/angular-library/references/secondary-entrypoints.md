# Secondary Entry Points

## What Are Secondary Entry Points?

A **secondary entry point** is an additional import path within the same library package that can be imported independently from the primary entry point.

For example, `@angular/common` provides:

- `@angular/common` — primary entry point
- `@angular/common/http` — secondary entry point

This allows consumers to import only what they need, enabling better tree-shaking.

---

## When to Use Secondary Entry Points

Use secondary entry points when:

- The library has **distinct feature areas** that are rarely used together (e.g., a `testing` utilities module).
- You want to avoid loading heavy dependencies when consumers only need a subset of the library.
- You provide **testing utilities** that should not be included in production bundles.

A common pattern is `my-lib/testing` for testing utilities or helpers (or `@my-org/my-lib/testing` for a scoped package). Note that `@my-lib/testing` would be a separate package named `testing` in the `@my-lib` scope, not a secondary entry point.

---

## Creating a Secondary Entry Point

Create a directory at the library root, next to `src/`, with its own `ng-package.json` and `public-api.ts`. ng-packagr derives the import subpath from the directory path relative to the library root, so `testing/` becomes `my-lib/testing` (a directory inside `src/` would become `my-lib/src/testing`):

```
projects/my-lib/
├── src/
│   ├── lib/                     ← primary entry point source
│   └── public-api.ts            ← primary public API
├── testing/                     ← secondary entry point (my-lib/testing)
│   ├── src/
│   │   ├── my-lib-harness.ts
│   │   └── public-api.ts
│   └── ng-package.json
└── ng-package.json
```

No other registration is needed: ng-packagr discovers every `ng-package.json` under the library root during the build.

### `testing/ng-package.json`

```json
{
  "$schema": "../../../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

A secondary `ng-package.json` accepts only the `lib` options (validated by `ng-entrypoint.schema.json`). Package-wide options such as `dest`, `assets`, and `allowedNonPeerDependencies` belong in the `ng-package.json` at the library root and apply to every entry point.

### `testing/src/public-api.ts`

```ts
export * from './my-lib-harness';
```

---

## Dependency Rules Between Entry Points

Entry points can import from each other in either direction: a secondary entry point can import from the primary one, and the primary entry point can import from a secondary one. The only constraint is that **dependencies between entry points must be acyclic**. ng-packagr builds them as a dependency graph and compiles each entry point after the ones it depends on.

Always import another entry point of the same library through its package import path, never through a relative path, because each entry point is compiled separately:

```ts
// ✅ Import another entry point by its package path
import {MyLib} from 'my-lib';

// ❌ Relative import across entry points
// import {MyLib} from '../../src/lib/my-lib';
```

ng-packagr fails the build if it detects a circular dependency between entry points.

---

## Building

ng-packagr automatically discovers and builds all secondary entry points when you run:

```bash
ng build my-lib
```

Under the Angular Package Format (APF), a single root `package.json` routes every entry point through its `exports` field. Flat ESM bundles go in `fesm2022/` and bundled type declarations go in `types/`, both named after the full module ID with `/` replaced by `-` (the leading `@` of a scope is dropped). The output in `dist/my-lib/` looks like:

```
dist/my-lib/
├── .npmignore               ← keeps testing/package.json out of the published package
├── package.json             ← exports map covering every entry point
├── fesm2022/
│   ├── my-lib.mjs           ← primary entry point bundle
│   └── my-lib-testing.mjs   ← secondary entry point bundle
├── types/
│   ├── my-lib.d.ts
│   └── my-lib-testing.d.ts
└── testing/
    └── package.json         ← { module, typings } redirect, used only for local resolution
```

The nested `testing/package.json` lets tools inside the workspace (such as the path mapping below) resolve `my-lib/testing` from `dist/`. ng-packagr lists it in the generated `.npmignore`, so it is not published: consumers of the npm package resolve every entry point through the root `exports` field.

---

## Using a Secondary Entry Point in the Same Workspace

`ng generate library` adds a path mapping for the package root only, which does not resolve subpaths such as `my-lib/testing`. Add a wildcard mapping to the workspace `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "my-lib": ["./dist/my-lib"],
      "my-lib/*": ["./dist/my-lib/*"]
    }
  }
}
```

---

> Keep secondary entry points minimal and purpose-specific. Too many entry points increase maintenance overhead.
