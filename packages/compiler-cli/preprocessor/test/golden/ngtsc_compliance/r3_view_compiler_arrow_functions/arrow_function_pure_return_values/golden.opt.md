# /out/arrow_function_pure_return_values.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_pure_return_values.ts
 * @generated
 */

import * as i0 from './arrow_function_pure_return_values';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' +
      ((a) /*D:ignore*/ => ({
        'foo' /*79,82*/: a /*84,85*/,
        'bar' /*87,90*/: this.componentProp /*92,105*/ /*92,105*/,
      }) /*78,106*/)(1 /*109,110*/) /*71,111*/.foo /*112,115*/ /*71,115*/;
  }
}

```

# /out/arrow_function_pure_return_values.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (a: any): any => ({ foo: a, bar: ctx.componentProp });

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
    vars: 2,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', i0.ɵɵarrowFunction(1, arrowFn0, ctx)(1).foo, ' ');
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
        {{(a => ({foo: a, bar: componentProp}))(1).foo}}
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
      filePath: 'arrow_function_pure_return_values.ts',
      lineNumber: 8,
    });
})();

```