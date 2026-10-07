# /out/directives.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class AbstractDirective {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AbstractDirective, never> =
    function AbstractDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AbstractDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    AbstractDirective,
    never,
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: AbstractDirective });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(AbstractDirective, [{ type: Directive }], null, null);
  }
}

```