# Migration to signal queries

Angular introduced improved APIs for queries that are considered
production ready as of v19.
Read more about signal queries and their benefits in the [dedicated guide](guide/signals/queries).

To support existing teams that would like to use signal queries, the Angular team
provides an automated migration that converts existing decorator query fields to the new API.

Run the schematic using the following command:

```bash
ng generate @angular/core:signal-queries-migration
```

Alternatively, the migration is available as a [code refactor action](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) in VSCode.
Install the latest version of the VSCode extension and click onto e.g. a `@ViewChild` field.
See more details in the section [below](#vscode-extension).

## What does the migration change?

1. `@ViewChild()`, `@ViewChildren`, `@ContentChild` and `@ContentChildren` class members
   are updated to their signal equivalents.
2. References in your application to migrated queries are updated to call the signal.
   - This includes references in templates, host bindings or TypeScript code.

**Before**

```typescript
import {Component, ContentChild} from '@angular/core';

@Component({
  template: `Has ref: {{someRef ? 'Yes' : 'No'}}`
})
export class MyComponent {
  @ContentChild('someRef') ref: ElementRef|undefined = undefined;

  someMethod() {
    if (this.ref) {
      this.ref.nativeElement;
    }
  }
}
```

**After**

```typescript
import {Component, contentChild} from '@angular/core';

@Component({
  template: `Has ref: {{someRef() ? 'Yes' : 'No'}}`
})
export class MyComponent {
  readonly ref = contentChild<ElementRef>('someRef');

  someMethod() {
    const ref = this.ref();
    if (ref) {
      ref.nativeElement;
    }
  }
}
```

## Configuration options

The migration supports a few options for fine tuning the migration to your specific needs.

### `--path`

By default, the migration will update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

### `--best-effort-mode`

By default, the migration skips queries that cannot be safely migrated.
The migration tries to refactor code as safely as possible.

When the `--best-effort-mode` flag is enabled, the migration eagerly
tries to migrate as much as possible, even if it could break your build.

### `--insert-todos`

When enabled, the migration will add TODOs to queries that couldn't be migrated.
The TODOs will include reasoning on why queries were skipped. E.g.

```ts
// TODO: Skipped for migration because:
//  Your application code writes to the query. This prevents migration.
@ViewChild('ref') ref?: ElementRef;
```

### `--analysis-dir`

In large projects you may use this option to reduce the amount of files being analyzed.
By default, the migration analyzes the whole workspace, regardless of the `--path` option, in
order to update all references affected by a query declaration being migrated.

With this option, you can limit analysis to a sub-folder. Note that this means that any
references outside this directory are silently skipped, potentially breaking your build.

## VSCode extension

![Screenshot of the VSCode extension and clicking on an `@ViewChild` field](assets/images/migrations/signal-queries-vscode.png "Screenshot of the VSCode extension and clicking on an `@ViewChild` field.")

The migration is available as a [code refactor action](https://code.visualstudio.com/docs/typescript/typescript-refactoring#_refactoring) in VSCode.

To make use of the migration via VSCode, install the latest version of the VSCode extension and either click:

- on a `@ViewChild`, `@ViewChildren`, `@ContentChild`, or `@ContentChildren` field.
- on a directive/component

Then, wait for the yellow lightbulb VSCode refactoring button to appear.
Via this button you can then select the signal queries migration.
