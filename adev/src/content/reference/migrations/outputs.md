# Migration to output function

Angular introduced an improved API for outputs in v17.3 that is considered
production ready as of v19. This API mimics the `input()` API but is not based on Signals.
Read more about custom events output function and its benefits in the [dedicated guide](guide/components/outputs).

To support existing projects that would like to use output function, the Angular team
provides an automated migration that converts `@Output` custom events to the new `output()` API.

Run the schematic using the following command:

```bash
ng generate @angular/core:output-migration
```

## What does the migration change?

1. `@Output()` class members are updated to their `output()` equivalent.
2. Imports in the file of components or directives, at Typescript module level, are updated as well.
3. Migrates the APIs functions like `event.next()`, which use is not recommended, to `event.emit()` and removes `event.complete()` calls.

**Before**

```typescript
import {Component, Output, EventEmitter} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`
})
export class MyComponent {
  @Output() someChange = new EventEmitter<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

**After**

```typescript
import {Component, output} from '@angular/core';

@Component({
  template: `<button (click)="someMethod('test')">emit</button>`
})
export class MyComponent {
  readonly someChange = output<string>();

  someMethod(value: string): void {
    this.someChange.emit(value);
  }
}
```

## Configuration options

The migration supports a few options for fine tuning the migration to your specific needs.

### `--path`

If not specified, the migration will ask you for a path and update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

### `--analysis-dir`

In large projects you may use this option to reduce the amount of files being analyzed.
By default, the migration analyzes the whole workspace, regardless of the `--path` option, in
order to update all references affected by an `@Output()` migration.

With this option, you can limit analysis to a sub-folder. Note that this means that any
references outside this directory are silently skipped, potentially breaking your build.

Use these options as shown below:

```bash
ng generate @angular/core:output-migration --path src/app/sub-folder
```

## Exceptions

In some cases, the migration will not touch the code.
One of these exceptions is the case where the event is used with a `pipe()` method.
The following code won't be migrated:

```typescript
export class MyDialogComponent {
  @Output() close = new EventEmitter<void>();
  doSome(): void {
    this.close.complete();
  }
  otherThing(): void {
    this.close.pipe();
  }
}
```
