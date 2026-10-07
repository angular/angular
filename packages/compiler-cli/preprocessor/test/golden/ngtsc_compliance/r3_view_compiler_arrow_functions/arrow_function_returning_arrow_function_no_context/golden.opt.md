# /out/arrow_function_returning_arrow_function_no_context.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_returning_arrow_function_no_context.ts
 * @generated
 */

import * as i0 from './arrow_function_returning_arrow_function_no_context';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' +
      (
        (a) /*D:ignore*/ => (b) /*D:ignore*/ => (c) /*D:ignore*/ => (d) /*D:ignore*/ =>
            a /*91,92*/ + b /*95,96*/ /*91,96*/ + c /*99,100*/ /*91,100*/ + d /*103,104*/
         /*91,104*/
      )(1 /*106,107*/)(/*70,108*/ 2 /*109,110*/)(/*70,111*/ 3 /*112,113*/)(
        /*70,114*/ 4 /*115,116*/,
      ) /*70,117*/;
  }
}

```

# /out/arrow_function_returning_arrow_function_no_context.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (a: any): any =>
  (b: any): any =>
  (c: any): any =>
  (d: any): any =>
    a + b + c + d;

export class TestComp {
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
        i0.ɵɵtextInterpolate(i0.ɵɵarrowFunction(1, arrowFn0, ctx)(1)(2)(3)(4));
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
                template: `{{(a => b => c => d => a + b + c + d)(1)(2)(3)(4)}}`,
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
      filePath: 'arrow_function_returning_arrow_function_no_context.ts',
      lineNumber: 6,
    });
})();

```