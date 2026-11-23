# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["deps.ts", "test.ts"]
}
```

# /deps.ts
```ts
import { Directive, Input } from '@angular/core';

@Directive({ selector: '[dep-a]', standalone: true })
export class DepA {
  @Input('a') aIn: string = '';
}
```

# /test.ts
```ts
import { Component } from '@angular/core';
import * as ns from './deps';

@Component({ selector: 'nsc', template: '', hostDirectives: [ns.DepA] })
export class NsComp {}

@Component({
  selector: 'nsc2',
  template: '',
  hostDirectives: [{ directive: ns.DepA, inputs: ['a: b'] }]
})
export class NsComp2 {}
```
