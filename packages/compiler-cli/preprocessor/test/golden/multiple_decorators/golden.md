# /out/greeting.component.ts
```ts
import { Directive, Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function Unrelated(clazz) {
  return clazz;
}

@Unrelated
export class GreetingDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GreetingDirective, never> =
    function GreetingDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || GreetingDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    GreetingDirective,
    never,
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: GreetingDirective });
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: GreetingDirective,
    factory: GreetingDirective.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GreetingDirective,
        [{ type: Directive, args: [{ standalone: true }] }, { type: Injectable }],
        null,
        null,
      );
  }
}

```