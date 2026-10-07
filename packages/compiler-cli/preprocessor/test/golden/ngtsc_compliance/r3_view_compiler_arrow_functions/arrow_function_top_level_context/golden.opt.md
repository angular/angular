# /out/arrow_function_top_level_context.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_top_level_context.ts
 * @generated
 */

import * as i0 from './arrow_function_top_level_context';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' +
      (
        (param) /*D:ignore*/ =>
          param /*80,85*/ + this.value /*88,93*/ /*88,93*/ /*80,93*/ + 1 /*96,97*/ /*80,97*/
      )('param' /*99,106*/) /*70,107*/;
  }
}

```

# /out/arrow_function_top_level_context.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (param: any): any =>
    param + ctx.value + 1;

export class TestComp {
  value = 0;
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
        i0.ɵɵtextInterpolate(i0.ɵɵarrowFunction(1, arrowFn0, ctx)('param'));
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
                template: `{{(param => param + value + 1)('param')}}`,
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
      filePath: 'arrow_function_top_level_context.ts',
      lineNumber: 6,
    });
})();

```