# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /decorators.ts
```ts
export function Track(name: string) {
  return function <T extends abstract new (...args: any[]) => any>(clazz: T): T {
    return clazz;
  };
}

export function Sealed<T extends abstract new (...args: any[]) => any>(clazz: T): T {
  return clazz;
}
```

# /app.component.ts
```ts
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Sealed, Track } from './decorators';

@Track('AboveComponent')
@Component({
  selector: 'above-cmp',
  template: '<div>Above</div>',
})
export class AboveComponent {}

@Component({
  selector: 'below-cmp',
  template: '<div>Below</div>',
})
@Track('BelowComponent')
export class BelowComponent {}

@Sealed
@Component({
  selector: 'bare-cmp',
  template: '<div>Bare</div>',
})
export class BareDecoratorComponent {}

@Track('SandwichComponent')
@Component({
  selector: 'sandwich-cmp',
  template: '<div>Sandwich</div>',
})
@Sealed
export class SandwichComponent {}

@Track('ConstPoolComponent')
@Component({
  selector: 'const-pool-cmp',
  template: '<ng-content select="header"></ng-content><div #el></div>',
})
export class ConstPoolComponent {
  @ViewChild('el') el?: ElementRef;
}

@Component({
  selector: 'const-pool-plain-cmp',
  template: '<ng-content select="header"></ng-content><div #el></div>',
})
export class ConstPoolPlainComponent {
  @ViewChild('el') el?: ElementRef;
}
```
