# /out/arrow_function_this_access.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_this_access.ts
 * @generated
 */

import * as i0 from './arrow_function_this_access';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' +
      (
        (a /*D:ignore*/, b /*D:ignore*/) =>
          a /*81,82*/ +
          this.a /*90,91*/ /*85,91*/ /*81,91*/ +
          b /*94,95*/ /*81,95*/ +
          this.b /*103,104*/ /*98,104*/ /*81,104*/
      )(1 /*106,107*/, 3 /*109,110*/) /*70,111*/;
  }
}

```

# /out/arrow_function_this_access.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (a: any, b: any): any =>
    a + ctx.a + b + ctx.b;

export class TestComp {
  a = 2;
  b = 4;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['ng-component']],
    decls: 1,
    vars: 2,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(i0.ɵɵarrowFunction(1, arrowFn0, ctx)(1, 3));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComp,
        [
          {
            type: Component,
            args: [
              {
                template: `{{((a, b) => a + this.a + b + this.b)(1, 3)}}`,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'arrow_function_this_access.ts',
      lineNumber: 6,
    });
})();

```