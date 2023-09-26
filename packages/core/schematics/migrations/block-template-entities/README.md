## Block syntax template entities migration

Angular v17 introduces a new control flow syntax that uses the `@` and `}` characters.
This migration replaces the existing usages with their corresponding HTML entities.
Usages within HTML starting tags, interpolations and ICU expressions are preserved.


#### Before
```ts
import {Component} from '@angular/core';

@Component({
  template: `My email is hello@hi.com. This is a brace -> }`
})
export class MyComp {}
```


#### After
```ts
import {Component} from '@angular/core';

@Component({
  template: `My email is hello&#64;hi.com. This is a brace -> &#125;`
})
export class MyComp {}
```
