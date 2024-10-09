# Signal input migration

The Angular team provides an automated migration for converting `@Input`
declarations to signal inputs.

Aside from the `@Input()` declarations, the migration will also take care of all
references to updated inputs.

## How to run this migration?

The migration can be run using the following command:

```bash
ng generate @angular/core:signal-input-migration
```

## What does it change?

1. `@Input()` class members are updated to their signal `input()` equivalent.
2. References in your application to migrated inputs are updated to call the signal.
   - This includes references in templates, host bindings or TypeScript code.

**Before**

```typescript
import {Component, Input} from '@angular/core';

@Component({
  template: `Name: {{name ?? ''}}`
})
export class MyComponent {
  @Input() name: string|undefined = undefined;

  someMethod(): number {
    if (this.name) {
      return this.name.length;
    }
    return -1;
  }
}
```

**After**

```typescript
import {Component, input} from '@angular/core';

@Component({
  template: `Name: {{name() ?? ''}}`
})
export class MyComponent {
  name = input<string>();

  someMethod(): number {
    const name = this.name();
    if (name) {
      return name.length;
    }
    return -1;
  }
}
```

## Configuration options

The migration supports a few options to fine-tune the migration for your specific needs.

### `--path`

By default, the migration will update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

### `--best-effort-mode`

Whenever the migration detects that it **cannot** safely migrated an input, it will
be skipped by default. You can change this by using this command line option.

### `--analysis-dir`

Optional flag that can be used in large code projects.

In large projects you may use this option to reduce the amount of files being analyzed.
By default, the migration analyzes the whole workspace, regardless of the `--path` option, in
order to update all references affected by an `@Input()` migration.

With this option, you can limit analysis to a sub-folder. Note that this means that any
references outside this directory are silently skipped, potentially breaking your build.
