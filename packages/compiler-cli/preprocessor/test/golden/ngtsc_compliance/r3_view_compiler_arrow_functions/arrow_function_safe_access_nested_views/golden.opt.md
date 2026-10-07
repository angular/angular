# /out/arrow_function_safe_access_nested_views.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_safe_access_nested_views.ts
 * @generated
 */

import * as i0 from './arrow_function_safe_access_nested_views';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    if (true /*78,82*/) {
      if (true /*97,101*/) {
        if (true /*118,122*/) {
          '' +
            (() =>
              this.componentProp /*134,147*/ /*134,147*/?.a /*149,150*/ /*134,150*/
                ?.b /*152,153*/ /*134,153*/
                ?.c /*155,156*/ /*134,156*/?.() /*134,160*/?.() /*134,164*/?.() /*134,168*/?.()) /*134,172*/;
        }
      }
    }
  }
}

```

# /out/arrow_function_safe_access_nested_views.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (): any => {
    i0.ɵɵrestoreView(view);
    const ctx_r0: any = i0.ɵɵnextContext(3);
    return i0.ɵɵresetView(ctx_r0.componentProp?.a?.b?.c?.()?.()?.()?.());
  };
function TestComp_Conditional_0_Conditional_0_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' ', i0.ɵɵarrowFunction(1, arrowFn0, ctx), ' ');
  }
}
function TestComp_Conditional_0_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TestComp_Conditional_0_Conditional_0_Conditional_0_Template, 1, 2);
  }
  if (rf & 2) {
    i0.ɵɵconditional(true ? 0 : -1);
  }
}
function TestComp_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TestComp_Conditional_0_Conditional_0_Template, 1, 1);
  }
  if (rf & 2) {
    i0.ɵɵconditional(true ? 0 : -1);
  }
}

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
    decls: 1,
    vars: 1,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, TestComp_Conditional_0_Template, 1, 1);
      }
      if (rf & 2) {
        i0.ɵɵconditional(true ? 0 : -1);
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
        @if (true) {
          @if (true) {
            @if (true) {
              {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
            }
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
      filePath: 'arrow_function_safe_access_nested_views.ts',
      lineNumber: 14,
    });
})();

```