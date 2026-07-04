# ng-packagr and the Angular Package Format

## Overview

**ng-packagr** is the build tool used by the Angular CLI to compile Angular libraries into the **Angular Package Format (APF)**, which is the standard format for distributing Angular libraries on npm.

---

## `ng-package.json`

The `ng-package.json` file at the root of your library configures the ng-packagr build:

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": ["./styles/**/*.scss", "./themes/**/*.css"]
}
```

### Key Options

| Option           | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `lib.entryFile`  | Path to the public API file (required)                               |
| `assets`         | Files to copy to the dist folder (e.g. styles, themes)               |
| `deleteDestPath` | Whether to clean the output directory before build (default: `true`) |
| `dest`           | Custom output directory (defaults to `dist/<library-name>`)          |

---

## Angular Package Format (APF)

ng-packagr produces an output conforming to the APF. The key outputs are:

| File / Folder  | Purpose                                      |
| -------------- | -------------------------------------------- |
| `fesm2022/`    | Flattened ESM (single file, fewer imports)   |
| `types/`       | TypeScript type declarations                 |
| `package.json` | npm package descriptor with `exports` field  |

Modern bundlers (Webpack, esbuild, Rollup) resolve the `exports` field in `package.json` to pick the right format automatically.

---

## `peerDependencies`

Libraries should **not** bundle Angular itself. Instead, declare Angular as a peer dependency in the library's `package.json`:

```json
{
  "name": "my-lib",
  "version": "1.0.0",
  "peerDependencies": {
    "@angular/core": "^19.0.0",
    "@angular/common": "^19.0.0"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  }
}
```

### Rules for `peerDependencies`

### Use peerDependencies (The Standard)

Use for framework engines (`@angular/core`), state management (`rxjs`), and any shared utility used by **multiple libraries** (like `date-fns` or `moment`).

**Why:** Avoid the "Multiple Libs Bloat Risk" - If three different libraries list `date-fns` as a  dependency, the bundler may include three separate versions. Moving it to `peerDependencies` forces the host app to unify them into a single copy, **radically shrinking the final bundle size**.

### Use dependencies (The Rare Exception)

Use **only** for highly specialized, internal helpers unique to that specific library that no other part of the ecosystem cares about.

**Exception:** `tslib` must **always** be added as a direct dependency, since its version is tied to the TypeScript compiler version used for compilation.

---

## Enabling CSS / SCSS Compilation

For libraries that ship styles, ng-packagr can compile SCSS to CSS. Reference them in component metadata:

```ts
@Component({
  selector: 'my-button',
  templateUrl: './my-button.html',
  styleUrls: ['./my-button.scss'],
})
export class MyButton  {}
```

To ship **global styles or themes** (not scoped to a component), list them in `ng-package.json` under `assets`.

### Exposing Assets via Package Exports

When including additional assets like Sass mixins or pre-compiled CSS, you must manually add these to the conditional `"exports"` in the primary `package.json` of your library.

`ng-packagr` merges these handwritten `"exports"` with the auto-generated ones, allowing you to configure custom export subpaths:

```json
"exports": {
  ".": {
    "sass": "./_index.scss",
  },
  "./theming": {
    "sass": "./_theming.scss"
  },
  "./prebuilt-themes/indigo-pink.css": {
    "style": "./prebuilt-themes/indigo-pink.css"
  }
}
```

---

## Preserving comments for API documentation

ng-packagr strips most comments by default. If you need generated API docs (Compodoc, TypeDoc), add TSDoc-compatible comments directly above exported symbols. Use TSDoc tags (for example @example); these are TSDoc comments, not JSDoc:

```ts
/**
 * A button component with Angular Aria support.
 *
 * @example
 * <my-button variant="primary">Click me</my-button>
 */
@Component({...})
export class MyButton {}
```

---

> Do not manually edit the files inside `dist/`. They are generated artifacts and will be overwritten on every build. This is not recommended.
