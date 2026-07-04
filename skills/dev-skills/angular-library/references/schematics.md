# Angular Schematics for Libraries

## Overview

**Schematics** allow your Angular library to provide CLI-integrated automation to consumers, such as:

- `ng add @my-org/my-lib` — automatic installation and setup
- `ng generate @my-org/my-lib:component` — code generation

Schematics are TypeScript programs that read and transform the file system using a virtual tree.

---

## Setting Up Schematics in a Library

### 1. Install Schematics Dependencies

Only the devkit package is required; the separate `@angular-devkit/schematics-cli` package is not required.

```bash
npm install --save-dev @angular-devkit/schematics
```

### 2. Create the Schematics Folder

Inside the library project, create a `schematics/` directory:

```
projects/my-lib/
├── src/
├── schematics/
│   ├── ng-add/
│   │   ├── index.ts         ← schematic factory
│   │   └── schema.json      ← JSON schema for options
│   └── collection.json      ← schematics registry
└── ng-package.json
```

### 3. Define `collection.json`

```json
{
  "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "ng-add": {
      "description": "Add MyLib to an Angular project.",
      "factory": "./ng-add/index",
      "schema": "./ng-add/schema.json"
    }
  }
}
```

### 4. Register the Collection in `package.json`

```json
{
  "name": "@my-org/my-lib",
  "schematics": "./schematics/collection.json"
}
```

---

## Writing an `ng-add` Schematic

The `ng-add` schematic runs automatically when a consumer executes `ng add @my-org/my-lib`.

```ts
// schematics/ng-add/index.ts
import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask} from '@angular-devkit/schematics/tasks';

export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // Schedule npm install
    context.addTask(new NodePackageInstallTask());

    // Optionally modify files (e.g., add provideMyLib() to app.config.ts)
    // const configPath = '/src/app/app.config.ts';
    // const content = tree.read(configPath)?.toString('utf-8') ?? '';
    // tree.overwrite(configPath, modifiedContent);

    context.logger.log('info', '✅ MyLib has been added to your project.');
    return tree;
  };
}
```

---

## Writing a `ng-generate` Schematic

```ts
// schematics/my-component/index.ts
import {Rule, apply, mergeWith, template, url, move} from '@angular-devkit/schematics';
import {strings} from '@angular-devkit/core';
import {Schema} from './schema';

export function myComponent(options: Schema): Rule {
  const templateSource = apply(url('./files'), [
    template({
      ...strings,
      ...options,
    }),
    move(options.path ?? ''),
  ]);

  return mergeWith(templateSource);
}
```

Template files live in a `files/` subdirectory and can use `<%= name %>` interpolation.

---

## Writing an `ng update` Schematic

An `ng update` schematic provides migrations for consumers when they upgrade your library to a new major version.

1. **Define a `migration.json`** file in your schematics folder (similar to `collection.json` but specifically for updates):

```json
{
  "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "my-lib-migration-v2": {
      "version": "2",
      "description": "Migrates MyLib to version 2.",
      "factory": "./update-v2/index"
    }
  }
}
```

2. **Register it in `package.json`**:

```json
{
  "name": "@my-org/my-lib",
  "ng-update": {
    "migrations": "./schematics/migration.json"
  }
}
```

3. **Write the migration logic** in `./schematics/update-v2/index.ts` to transform old APIs to new APIs using the `Tree`.

---

## Building Schematics

Schematics must be compiled to JavaScript before they are usable. Add a build step:

```json
// tsconfig.schematics.json
{
  "compilerOptions": {
    "baseUrl": "tsconfig.json",
    "declaration": false,
    "module": "commonjs",
    "outDir": "../../dist/my-lib/schematics",
    "skipLibCheck": true,
    "target": "ES2022"
  },
  "include": ["projects/my-lib/schematics/**/*.ts"]
}
```

Build command:

```bash
tsc -p tsconfig.schematics.json
```

Add this step to the library publish pipeline.

---

## Testing Schematics

Use `SchematicTestRunner` from `@angular-devkit/schematics/testing`:

```ts
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import * as path from 'node:path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('ng-add', () => {
  it('should run without errors', async () => {
    const runner = new SchematicTestRunner('my-lib', collectionPath);
    const tree = await runner.runSchematic('ng-add', {}, Tree.empty());
    expect(tree).toBeTruthy();
  });
});
```

---

> Always test schematics in a real Angular workspace before publishing. The virtual tree in unit tests may not catch all real-world issues.
