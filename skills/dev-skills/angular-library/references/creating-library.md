# Creating an Angular Library

## Overview

An Angular library is a reusable Angular project that can be shared across multiple Angular applications or published to npm.

Libraries are created inside an Angular **workspace** (a project created with `ng new`).

---

## Generating a Library

Use the Angular CLI to generate a library. It is common to create a dedicated workspace without an initial application:

```bash
ng new my-workspace --no-create-application
cd my-workspace
ng generate library my-lib
```

Or with a scope:

```bash
ng generate library @my-org/my-lib
```

This creates the following structure in the workspace:

```
my-workspace/
├── projects/
│   └── my-lib/
│       ├── src/
│       │   ├── lib/
│       │   │   ├── my-lib.component.ts
│       │   │   ├── my-lib.service.ts
│       │   │   └── my-lib.component.spec.ts
│       │   └── public-api.ts       ← controls what consumers can import
│       ├── ng-package.json         ← ng-packagr configuration
│       ├── package.json
│       └── tsconfig.lib.json
├── angular.json
└── tsconfig.json
```

---

## Building the Library

Build the library before using it locally or publishing:

```bash
ng build my-lib
```

The output is placed in `dist/my-lib/` by default.

> **Path Mapping Warning:** An application that depends on a library should only use TypeScript path mappings that point to the _built library_ in the `dist/` folder. Path mappings should **not** point to the library source `.ts` files, because the build systems are different (`esbuild` for applications vs `ng-packagr` for libraries).

---

## Using the Library in the Same Workspace

After building, Angular automatically configures path mappings in `tsconfig.json` so the consuming app can import from the library by name:

```ts
import {MyLibComponent} from 'my-lib';
```

For **development without rebuilding on every change**, use the `--watch` flag:

```bash
ng build my-lib --watch
```

---

## Key Files Explained

### `ng-package.json`

Configures the ng-packagr build:

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}
```

### `public-api.ts`

The single entry point defining the library's public surface. See [public-api.md](public-api.md).

### `package.json`

Defines the library's name, version, and `peerDependencies`. See [publishing-npm.md](publishing-npm.md).

---

## Scaffolding Inside the Library

After generating the library, use the CLI to add components, services, and other artifacts scoped to it:

```bash
ng generate component my-component --project=my-lib
ng generate service my-service --project=my-lib
ng generate directive my-directive --project=my-lib
ng generate pipe my-pipe --project=my-lib
```

> **Note:** By default in modern Angular versions, `ng generate component` creates **standalone** components. This is the recommended pattern for libraries as well, avoiding the need for internal `NgModule`s.

---

> Libraries cannot use browser-specific APIs directly in their module code if you intend to support SSR consumers. Use `isPlatformBrowser` or inject `PLATFORM_ID` where needed.

---

## Refactoring Applications into Libraries

When moving application code into a library to make it reusable:

- **Stateless Components:** Components and pipes should be stateless. Avoid relying on external application-specific state.
- **Tree-Shakable Providers:** Services should use `providedIn: 'root'` instead of being declared in `NgModule` providers so they can be tree-shaken by consumers.
- **Lightweight Tokens:** For optional services, use the lightweight injection token pattern to ensure the library doesn't drag in unnecessary dependencies.

---

## Linking Libraries for Local Development

To test a standalone library with an external application during local development (without publishing to npm or using a monorepo), use `npm link` or `pnpm link`.

You must configure the **consuming application's** `angular.json` to properly handle the symlinks:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "preserveSymlinks": true
          }
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": {
            "prebundle": {
              "exclude": ["my-lib"]
            }
          }
        }
      }
    }
  }
}
```

- `preserveSymlinks: true` prevents multiple copies of dependencies.
- `prebundle.exclude` ensures Vite does not cache the linked library, allowing it to be rebuilt when changes occur.
