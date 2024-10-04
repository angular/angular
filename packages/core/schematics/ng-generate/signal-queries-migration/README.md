# Signal queries migration

The Angular team provides an automated migration for converting decorator
queries to signal queries. E.g. `@ViewChild` will be converted to `viewChild()`.

Aside from the query declarations, the migration will also take care of all
references to updated queries.

## How to run this migration?

The migration can be run using the following command:

```bash
ng generate @angular/core:signal-queries-migration
```

## What does it change?

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
    const refValue = this.ref();
    if (refValue) {
      refValue.nativeElement;
    }
  }
}
```

## Configuration options

The migration supports a few options to fine-tune the migration for your specific needs.

### `--path`

By default, the migration will update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

### `--analysis-dir`

Optional flag that can be used in large code projects.

In large projects you may use this option to reduce the amount of files being analyzed.
By default, the migration analyzes the whole workspace, regardless of the `--path` option, in
order to update all references affected by a query declaration being migrated.

With this option, you can limit analysis to a sub-folder. Note that this means that any
references outside this directory are silently skipped, potentially breaking your build.
