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
| `esm2022/`     | ES Modules (tree-shakable, used by bundlers) |
| `fesm2022/`    | Flattened ESM (single file, fewer imports)   |
| `*.d.ts`       | TypeScript type declarations                 |
| `*.d.ts.map`   | Declaration source maps                      |
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
    "@angular/core": ">=19.0.0",
    "@angular/common": ">=19.0.0"
  },
  "dependencies": {}
}
```

### Rules for `peerDependencies`

- Declare all `@angular/*` packages your library imports as `peerDependencies`.
- Use `>=` version ranges to stay compatible with future Angular versions.
- Only add to `dependencies` packages that are not expected to be installed by the consumer (rare for Angular libs).
- Never put `@angular/core` or `rxjs` in `dependencies`.

---

## Enabling CSS / SCSS Compilation

For libraries that ship styles, ng-packagr can compile SCSS to CSS. Reference them in component metadata:

```ts
@Component({
  selector: 'my-button',
  templateUrl: './my-button.component.html',
  styleUrl: './my-button.component.scss',
})
export class MyButtonComponent {}
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

## Preserving Comments for API Documentation

ng-packagr strips most comments by default. To preserve JSDoc comments for API documentation tools (e.g., Compodoc, TypeDoc), they must be attached directly above exported symbols and follow the JSDoc format:

```ts
/**
 * A button component with Angular Aria support.
 *
 * @example
 * <my-button variant="primary">Click me</my-button>
 */
@Component({...})
export class MyButtonComponent {}
```

---

> Do not manually edit the files inside `dist/`. They are generated artifacts and will be overwritten on every build.
