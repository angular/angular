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

A common pattern is `@my-lib/testing` for testing utilities or helpers.

---

## Creating a Secondary Entry Point

Create a subdirectory inside the library's `src/` folder with its own `ng-package.json` and `public-api.ts`:

```
projects/my-lib/
├── src/
│   ├── lib/                     ← primary entry point source
│   └── public-api.ts            ← primary public API
├── testing/                     ← secondary entry point
│   ├── src/
│   │   ├── my-lib-harness.ts
│   │   └── public-api.ts
│   └── ng-package.json
└── ng-package.json
```

### `testing/ng-package.json`

```json
{
  "$schema": "../../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

### `testing/src/public-api.ts`

```ts
export * from './my-lib-testing';
```

---

## Dependency Rules Between Entry Points

Secondary entry points can depend on the primary entry point. Primary entry points **can also depend on secondary entry points** - this is a normal and valid pattern. The key constraint is to **avoid circular dependencies** between entry points.

```ts
// ✅ Allowed: testing entry point imports from primary
import {MyLib} from 'my-lib';

// ✅ Allowed when appropriate: primary entry point imports from secondary
import {MyLibTesting} from 'my-lib/testing';
```

ng-packagr enforces entry-point boundaries and helps catch invalid or cyclic dependencies at build time.

---

## Building

ng-packagr automatically discovers and builds all secondary entry points when you run:

```bash
ng build my-lib
```

The output in `dist/my-lib/` will contain:

```
dist/my-lib/
├── package.json
├── types/         ← primary entry point typings
├── fesm2022/
│   └── my-lib.mjs
│── testing/
│   ├── package.json
│   ├── types/      ← secondary entry point typings
│   └── fesm2022/
        └── my-lib-testing.mjs
```

---

> Keep secondary entry points minimal and purpose-specific. Too many entry points increase maintenance overhead.
