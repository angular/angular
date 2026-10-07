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
import { Directive, EventEmitter, Input, Output, forwardRef } from '@angular/core';

@Directive({ selector: '[dep-a]', standalone: true })
export class DepA {
  @Input('a') aIn: string = '';
  @Output('c') cOut = new EventEmitter<void>();
}

@Directive({ selector: '[dep-b]', standalone: true })
export class DepB {
  @Input('x') xIn: string = '';
}

export const IMPORTED_HOST_DIRS = [DepA, { directive: DepB, inputs: ['x: y'] }];

export const freeRef = forwardRef;
```

# /test.ts
```ts
import { Component, Directive, forwardRef } from '@angular/core';
import { DepA, DepB, IMPORTED_HOST_DIRS } from './deps';
import * as ns from './deps';

@Component({ selector: 'c1', template: '', hostDirectives: [DepA] })
export class C1 {}

const LOCAL_HOST_DIRS = [DepA, DepB];
@Component({ selector: 'c2', template: '', hostDirectives: LOCAL_HOST_DIRS })
export class C2 {}

@Component({ selector: 'c3', template: '', hostDirectives: IMPORTED_HOST_DIRS })
export class C3 {}

const fref = forwardRef;
@Component({ selector: 'c4', template: '', hostDirectives: [fref(() => LateDir)] })
export class C4 {}

const INPUTS = ['a: b'];
const OUTPUTS = ['c: d'];
@Component({
  selector: 'c6',
  template: '',
  hostDirectives: [{ directive: DepA, inputs: INPUTS, outputs: OUTPUTS }]
})
export class C6 {}

const SPREADABLE = [DepA];
@Component({ selector: 'c7', template: '', hostDirectives: [...SPREADABLE, DepB] })
export class C7 {}

const AliasedDir = DepA;
@Component({ selector: 'c8', template: '', hostDirectives: [AliasedDir] })
export class C8 {}

@Component({ selector: 'c10', template: '', hostDirectives: [ns.DepA] })
export class C10 {}

@Component({
  selector: 'c11',
  template: '',
  hostDirectives: [{ directive: ns.DepB, inputs: ['x: q'] }]
})
export class C11 {}

// forwardRef whose target is imported: `isForwardReference` must survive the cross-file hole,
// or the array is emitted eagerly and defeats the point of the forwardRef.
@Component({ selector: 'c12', template: '', hostDirectives: [forwardRef(() => DepA)] })
export class C12 {}

@Component({
  selector: 'c13',
  template: '',
  hostDirectives: [{ directive: forwardRef(() => DepB), inputs: ['x: y'] }]
})
export class C13 {}

// A present-but-empty mapping is `{}` upstream, which is truthy, so the object form is kept.
@Component({ selector: 'c14', template: '', hostDirectives: [{ directive: DepA, inputs: [] }] })
export class C14 {}

// `split(':', 2)` truncates: everything after the second colon is discarded.
@Component({
  selector: 'c15',
  template: '',
  hostDirectives: [{ directive: DepA, inputs: ['a: b: c'] }]
})
export class C15 {}

@Directive({ selector: '[late]', standalone: true })
export class LateDir {}
```
