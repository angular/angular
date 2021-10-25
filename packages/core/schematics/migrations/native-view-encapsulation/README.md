## `ViewEncapsulation.Native` migration

Automatically migrates usages of `ViewEncapsulation.Native` to `ViewEncapsulation.ShadowDom`.
For most practical purposes the `Native` mode is compatible with the `ShadowDom` mode.

The migration covers any reference to the `Native` value that can be traced to `@angular/core`.
Some examples:
* Inside the `encapsulation` property of `Component` decorators.
* In property assignments for the `COMPILER_OPTIONS` provider.
* In variables.

#### Before
```ts
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  template: '...',
  encapsulation: ViewEncapsulation.Native
})
export class App {
}
```

#### After
```ts
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  template: '...',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class App {
}
```
