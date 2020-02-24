## Undecorated classes with decorated fields migration

Automatically adds a `Directive` decorator to undecorated classes that have fields with Angular
decorators. Also adds the relevant imports, if necessary.

#### Before
```ts
import { Input } from '@angular/core';

export class Base {
  @Input() isActive: boolean;
}
```

#### After
```ts
import { Input, Directive } from '@angular/core';

@Directive()
export class Base {
  @Input() isActive: boolean;
}
```
