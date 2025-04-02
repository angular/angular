## Control Flow Syntax migration

Angular v17 introduces a new control flow syntax. This migration replaces the
existing usages of `*ngIf`, `*ngFor`, and `*ngSwitch` to their equivalent block
syntax. Existing ng-templates are preserved in case they are used elsewhere in
the template. It has the following option:

* `path` - Relative path within the project that the migration should apply to. Can be used to
migrate specific sub-directories individually. Defaults to the project root.

#### Before
```ts
import {Component} from '@angular/core';

@Component({
  template: `<div><span *ngIf="show">Content here</span></div>`
})
export class MyComp {
  show = false;
}
```


#### After
```ts
import {Component} from '@angular/core';

@Component({
  template: `<div>@if (show) {<span>Content here</span>}</div>`
})
export class MyComp {
  show = false
}
```
