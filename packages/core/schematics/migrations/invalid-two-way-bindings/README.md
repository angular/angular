## Invalid two-way bindings migration

Due to a quirk in the template parser, Angular previously allowed some unassignable expressions
to be passed into two-way bindings which may produce incorrect results. This migration will
replace the invalid two-way bindings with their input/output pair while preserving the original
behavior. Note that the migrated expression may not be the original intent of the code as it was
written, but they match what the Angular runtime would've executed.

The invalid bindings will become errors in a future version of Angular.

Some examples of invalid expressions include:
* Binary expressions like `[(ngModel)]="a || b"`. Previously Angular would append `= $event` to
the right-hand-side of the expression (e.g. `(ngModelChange)="a || (b = $event)"`).
* Unary expressions like `[(ngModel)]="!a"` which Angular would wrap in a parentheses and execute
(e.g. `(ngModelChange)="!(a = $event)"`).
* Conditional expressions like `[(ngModel)]="a ? b : c"` where Angular would add `= $event` to
the false case, e.g. `(ngModelChange)="a ? b : c = $event"`.

#### Before
```ts
import {Component} from '@angular/core';

@Component({
  template: `<input [(ngModel)]="a && b"/>`
})
export class MyComp {}
```


#### After
```ts
import {Component} from '@angular/core';

@Component({
  template: `<input [ngModel]="a && b" (ngModelChange)="a && (b = $event)"/>`
})
export class MyComp {}
```
