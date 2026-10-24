# /out/app.ts
```ts
import { Component, Directive, Inject, InjectionToken, Optional } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DepService {}
export const TOKEN = new InjectionToken<string>('TOKEN');

function CustomParamDec(): ParameterDecorator {
  return () => {};
}

@Component({
  selector: 'jit-ctor-cmp',
  template: '<div>JIT Ctor</div>',
  jit: true,
})
export class JitCtorComponent {
  constructor(
    @Optional() @Inject(TOKEN) public token: string,
    count: number,
    @CustomParamDec() public dep: DepService,
  ) {}

  static ctorParameters = (): any => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [TOKEN] }] },
    { type: undefined },
    { type: DepService },
  ];
}

@Directive({
  selector: '[jitEmptyCtor]',
  jit: true,
})
export class JitEmptyCtorDirective {
  constructor() {}
}

```