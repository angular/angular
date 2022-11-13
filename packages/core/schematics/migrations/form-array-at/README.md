## Typed Forms migration

As of Angular v16, the type of `FormArray.at` can return undefined. This migration automatically
identifies usages and adds non-null assertions.

#### Before

```ts
import {Component} from '@angular/core';
import {FormArray} from '@angular/forms';
@Component()
export class MyComponent {
  private _formArray = new FormArray();
  getFirstValue() {
    return this._formArray.at(0).value; // <- Compilation error in v16.
  }
}
```

#### After

```ts
import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
@Component()
export class MyComponent {
  private _formArray = new FormArray();
  getFirstValue() {
    return this._formArray.at(0)!.value; // <- Non-null assertion added during the migration.
  }
}
```
