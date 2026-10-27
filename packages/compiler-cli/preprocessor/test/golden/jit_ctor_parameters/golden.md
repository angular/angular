# /out/app.ts
```ts
import { Component, Directive, Inject, InjectionToken, Optional } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DepService {}
export interface SomeInterface {}
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
    visible: boolean,
    nullableLabel: string | null,
    items: string[],
    callback: () => void,
    config: object,
    iface: SomeInterface,
    untyped = 'fallback',
    @Optional() untypedOptional = 'opt',
    @CustomParamDec() public dep: DepService = new DepService(),
  ) {}

  static ctorParameters = (): any => [
    { type: String, decorators: [{ type: Optional }, { type: Inject, args: [TOKEN] }] },
    { type: Number },
    { type: Boolean },
    { type: String },
    { type: Array },
    { type: Function },
    { type: Object },
    { type: undefined },
    null,
    { type: undefined, decorators: [{ type: Optional }] },
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