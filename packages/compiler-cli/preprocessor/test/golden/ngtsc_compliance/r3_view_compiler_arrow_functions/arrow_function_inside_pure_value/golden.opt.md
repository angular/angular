# /out/arrow_function_inside_pure_value.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_inside_pure_value.ts
 * @generated
 */

import * as i0 from './arrow_function_inside_pure_value';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' +
      [(a) /*D:ignore*/ => a /*79,80*/ + 1 /*83,84*/ /*79,84*/] /*71,85*/[0 /*86,87*/](
        /*71,88*/ 1000 /*89,93*/,
      ) /*71,94*/ +
      [
        (a) /*D:ignore*/ =>
          a /*107,108*/ +
          1 /*111,112*/ /*107,112*/ +
          this.componentProp /*115,128*/ /*115,128*/ /*107,128*/,
      ] /*99,129*/[0 /*130,131*/](/*99,132*/ 1000 /*133,137*/) /*99,138*/;
  }
}

```

# /out/arrow_function_inside_pure_value.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => [a0];
const arrowFn0 =
  (ctx: any, view: any): any =>
  (a: any): any =>
    a + 1;
const arrowFn1 =
  (ctx: any, view: any): any =>
  (a: any): any =>
    a + 1 + ctx.componentProp;

export class TestComp {
  componentProp = 0;
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
    vars: 8,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate2(
          ' ',
          i0.ɵɵpureFunction1(4, _c0, i0.ɵɵarrowFunction(2, arrowFn0, ctx))[0](1000),
          ' ',
          i0.ɵɵpureFunction1(6, _c0, i0.ɵɵarrowFunction(3, arrowFn1, ctx))[0](1000),
          ' ',
        );
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
                template: `
        {{[(a) => a + 1][0](1000)}}
        {{[(a) => a + 1 + componentProp][0](1000)}}
      `,
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
      filePath: 'arrow_function_inside_pure_value.ts',
      lineNumber: 9,
    });
})();

```