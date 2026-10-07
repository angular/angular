# /out/arrow_function_safe_access.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_safe_access.ts
 * @generated
 */

import * as i0 from './arrow_function_safe_access';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' +
      (
        (value) /*D:ignore*/ =>
          value /*81,86*/?.a /*88,89*/ /*81,89*/?.b /*91,92*/ /*81,92*/
            ?.c /*94,95*/ /*81,95*/?.() /*81,99*/?.() /*81,103*/?.() /*81,107*/?.() /*81,111*/
      )(this.componentProp /*113,126*/ /*113,126*/) /*71,127*/;
    '' +
      (() =>
        this.componentProp /*151,164*/ /*151,164*/?.a /*166,167*/ /*151,167*/
          ?.b /*169,170*/ /*151,170*/
          ?.c /*172,173*/ /*151,173*/?.() /*151,177*/?.() /*151,181*/?.() /*151,185*/?.()) /*151,189*/;
  }
}

```

# /out/arrow_function_safe_access.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (value: any): any =>
    value?.a?.b?.c?.()?.()?.()?.();
const arrowFn1 =
  (ctx: any, view: any): any =>
  (): any =>
    ctx.componentProp?.a?.b?.c?.()?.()?.()?.();

export class TestComp {
  componentProp: { a?: { b?: { c?: () => () => () => () => string } } } = {};
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
    decls: 3,
    vars: 4,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomElement(1, 'hr');
        i0.ɵɵtext(2);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', i0.ɵɵarrowFunction(2, arrowFn0, ctx)(ctx.componentProp), ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' ', i0.ɵɵarrowFunction(3, arrowFn1, ctx), ' ');
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
        {{(value => value?.a?.b?.c?.()?.()?.()?.())(componentProp)}}
        <hr>
        {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
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
      filePath: 'arrow_function_safe_access.ts',
      lineNumber: 10,
    });
})();

```