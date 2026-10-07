# /tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true
  },
  "files": ["unexpected-core.component.ts", "foreign-param.directive.ts"]
}
```

# /logged.ts

```ts
export function Logged() {
  return (_target: object, _key: string | symbol | undefined, _index: number) => {};
}
```

# /unexpected-core.component.ts

```ts
import { Component, Injectable } from '@angular/core';

export class Dep {}

@Component({
  selector: 'unexpected-core',
  standalone: true,
  template: '<div>Unexpected</div>',
})
export class UnexpectedCoreComponent {
  constructor(dep: Dep, @Injectable() other: Dep) {}
}
```

# /foreign-param.directive.ts

```ts
import { Directive } from '@angular/core';
import { Logged } from './logged';

export class Dep {}

@Directive({
  selector: '[appForeignParam]',
  standalone: true,
})
export class ForeignParamDirective {
  constructor(@Logged() dep: Dep) {}
}
```
