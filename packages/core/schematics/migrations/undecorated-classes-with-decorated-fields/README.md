## Undecorated classes with decorated fields migration

Automatically adds a `Directive` decorator to undecorated classes that use Angular features. A
class is considered using Angular features if a class member is decorated (e.g. `@Input()`), or
if the class defines any lifecycle hooks.

This matches the undecorated classes compatibility logic in ngtsc that will be removed
as part of v10 so that the new mental model is enforced.    

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
