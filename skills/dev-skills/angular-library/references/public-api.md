# Public API Surface

## What is the Public API?

The **public API** of a library is the set of symbols (components, directives, services, pipes, functions, types, etc.) that consumers can import.

It is defined by the `public-api.ts` file referenced as the `entryFile` in `ng-package.json`.

---

## The `public-api.ts` File

Everything exported from `public-api.ts` becomes part of the library's public contract:

```ts
// src/public-api.ts

export * from './lib/my-lib';
export * from './lib/my-lib.service';
export * from './lib/my-lib.pipe';
export * from './lib/tokens';
export type {MyLibConfig} from './lib/config';
```

Consumers then import directly from the library name:

```ts
import {MyLib, MyLibService} from 'my-lib';
```

---

## What to Export

| Symbol type                   | Export? | Notes                                   |
| ----------------------------- | ------- | --------------------------------------- |
| Components, Directives, Pipes | ✅ Yes  | Core building blocks                    |
| Public Services               | ✅ Yes  | If consumers need to inject them        |
| `InjectionToken`s             | ✅ Yes  | If consumers need to provide values     |
| TypeScript interfaces / types | ✅ Yes  | For consumer type safety                |
| Internal utilities            | ❌ No   | Keep as implementation details          |
| Internal helper services      | ❌ No   | Only export if consumers need DI access |

---

## Controlling Type-Only Exports

Use `export type` for types and interfaces that are only needed for type checking. This prevents them from being included in the runtime bundle:

```ts
export type {MyConfig} from './lib/config';
export type {MyEventData} from './lib/events';
```

---

## Breaking Changes and API Stability

- **Every export is a public commitment.** Removing or renaming an export is a breaking change.
- Use semantic versioning (semver) to communicate changes to consumers.
- Mark unstable APIs with a comment or a separate `experimental` entry point:

```ts
// Only export stable APIs from public-api.ts
export * from './lib/stable-feature';
```

---

## Barrel File Discipline

Avoid re-exporting everything from barrel files without intent. Only export what consumers genuinely need.

> **Tip:** Periodically audit `public-api.ts` to remove symbols that were accidentally exposed or are no longer needed. Each removal after release is a breaking change, so it is better to be conservative upfront.
