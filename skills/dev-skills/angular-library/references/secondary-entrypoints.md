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

A common pattern is `@my-lib/testing`:

```ts
import {MyLibHarness} from '@my-lib/testing';
```

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
export * from './my-lib-harness';
```

---

## Dependency Rules Between Entry Points

Secondary entry points **can depend on the primary entry point**, but not the other way around.

```ts
// ✅ Allowed: testing entry point imports from primary
import {MyLibComponent} from 'my-lib';

// ❌ Forbidden: primary entry point imports from secondary
import {MyLibHarness} from 'my-lib/testing';
```

ng-packagr enforces this rule at build time.

---

## Building

ng-packagr automatically discovers and builds all secondary entry points when you run:

```bash
ng build my-lib
```

The output in `dist/my-lib/` will contain:

```
dist/my-lib/
├── index.d.ts          ← primary entry point typings
├── testing/
│   └── index.d.ts      ← secondary entry point typings
├── esm2022/
│   ├── my-lib.mjs
│   └── testing/
│       └── my-lib-testing.mjs
└── package.json
```

---

> Keep secondary entry points minimal and purpose-specific. Too many entry points increase maintenance overhead.
