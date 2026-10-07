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
import { Component } from '@angular/core';

export class BaseClass {
  constructor(public arg: string) {}
}

@Component({
  selector: 'app-child',
  template: '<div></div>',
  standalone: true,
})
export class ChildComp extends BaseClass {
  // Declares its own constructor. Should generate own ctor deps.
  constructor(arg: string, public extra: number) {
    super(arg);
  }
}

@Component({
  selector: 'app-child-zero',
  template: '<div></div>',
  standalone: true,
})
export class ChildZeroComp extends BaseClass {
  // Declares its own 0-argument constructor. Should generate normal factory.
  constructor() {
    super('zero');
  }
}
```
