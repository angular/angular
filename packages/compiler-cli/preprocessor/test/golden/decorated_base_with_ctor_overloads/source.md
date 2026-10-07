# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import { Directive, Inject, Injectable, InjectionToken, Optional } from '@angular/core';

export const MY_TOKEN = new InjectionToken<string>('MY_TOKEN');

export interface MyInterface {
  value: string;
}

@Directive({
  selector: '[base]',
  standalone: true,
})
export abstract class Base {
  constructor(scrollStrategy: any, parentMenu: MyInterface);
  constructor(scrollStrategy: any, parentMenu: MyInterface, extra?: boolean);
  constructor(
    @Inject(MY_TOKEN) public scrollStrategy: any,
    @Inject(MY_TOKEN) @Optional() public parentMenu: MyInterface,
    public extra?: boolean,
  ) {}
}

@Directive({
  selector: '[child]',
  standalone: true,
})
export class Child extends Base {
  // Inherits constructor from Base.
}
```
