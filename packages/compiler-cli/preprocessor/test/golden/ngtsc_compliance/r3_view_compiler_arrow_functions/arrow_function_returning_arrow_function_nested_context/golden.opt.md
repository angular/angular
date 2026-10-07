# /out/arrow_function_returning_arrow_function_nested_context.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_returning_arrow_function_nested_context.ts
 * @generated
 */

import * as i0 from './arrow_function_returning_arrow_function_nested_context';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    const _t1 /*78,89*/ = 1 /*92,93*/; /*73,94*/
    if (true /*105,109*/) {
      const _t2 /*124,133*/ = 2 /*136,137*/; /*119,138*/
      if (true /*151,155*/) {
        '' +
          (
            (a) /*D:ignore*/ => (b) /*D:ignore*/ => (c) /*D:ignore*/ => (d) /*D:ignore*/ =>
                a /*182,183*/ +
                b /*186,187*/ /*182,187*/ +
                c /*190,191*/ /*182,191*/ +
                d /*194,195*/ /*182,195*/ +
                this.componentProp /*198,211*/ /*198,211*/ /*182,211*/ +
                _t1 /*214,225*/ /*182,225*/ +
                _t2 /*228,237*/
             /*182,237*/
          )(1 /*239,240*/)(/*161,241*/ 2 /*242,243*/)(/*161,244*/ 3 /*245,246*/)(
            /*161,247*/ 4 /*248,249*/,
          ) /*161,250*/;
      }
    }
  }
}

```

# /out/arrow_function_returning_arrow_function_nested_context.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (a: any): any => {
    i0.ɵɵrestoreView(view);
    i0.ɵɵnextContext();
    const nestedLet_r1: any = i0.ɵɵreadContextLet(0);
    const ctx_r1: any = i0.ɵɵnextContext();
    const topLevelLet_r3: any = i0.ɵɵreadContextLet(0);
    return i0.ɵɵresetView(
      (b: any): any =>
        (c: any): any =>
        (d: any): any =>
          a + b + c + d + ctx_r1.componentProp + topLevelLet_r3 + nestedLet_r1,
    );
  };
function TestComp_Conditional_1_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' ', i0.ɵɵarrowFunction(1, arrowFn0, ctx)(1)(2)(3)(4), ' ');
  }
}
function TestComp_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, TestComp_Conditional_1_Conditional_1_Template, 1, 2);
  }
  if (rf & 2) {
    i0.ɵɵstoreLet(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(true ? 1 : -1);
  }
}

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
    decls: 2,
    vars: 2,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵconditionalCreate(1, TestComp_Conditional_1_Template, 2, 2);
      }
      if (rf & 2) {
        i0.ɵɵstoreLet(1);
        i0.ɵɵadvance();
        i0.ɵɵconditional(true ? 1 : -1);
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
        @let topLevelLet = 1;

        @if (true) {
          @let nestedLet = 2;

          @if (true) {
            {{(a => b => c => d => a + b + c + d + componentProp + topLevelLet + nestedLet)(1)(2)(3)(4)}}
          }
        }
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
      filePath: 'arrow_function_returning_arrow_function_nested_context.ts',
      lineNumber: 16,
    });
})();

```