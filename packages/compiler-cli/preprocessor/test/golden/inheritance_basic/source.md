# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["inheritance.ts"]
}
```

# /inheritance.ts
```ts
import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[base]',
  standalone: true,
})
export class BaseDir {
  constructor(public el: ElementRef) {}
}

@Directive({
  selector: '[child]',
  standalone: true,
})
export class ChildDir extends BaseDir {
  // Inherits constructor from BaseDir. Should delegate factory to BaseDir's factory.
}

@Directive({
  selector: '[childWithCtor]',
  standalone: true,
})
export class ChildWithCtorDir extends BaseDir {
  // Declares its own constructor. Should generate own ctor deps.
  constructor(el: ElementRef) {
    super(el);
  }
}
```
