# /out/arrow_function_let_nested.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_let_nested.ts
 * @generated
 */

import * as i0 from './arrow_function_let_nested';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    const _t1 /*78,79*/ = 1 /*82,83*/; /*73,84*/
    if (true /*95,99*/) {
      const _t2 /*114,115*/ = 2 /*118,119*/; /*109,120*/
      if (true /*133,137*/) {
        const _t3 /*154,155*/ = 3 /*158,159*/; /*149,160*/
        '' +
          (
            () => _t1 /*170,171*/ + _t2 /*174,175*/ /*170,175*/ + _t3 /*178,179*/ /*170,179*/
          )() /*163,182*/;
      }
    }
  }
}

```

# /out/arrow_function_let_nested.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (): any => {
    i0.ɵɵrestoreView(view);
    const c_r1: any = i0.ɵɵreadContextLet(0);
    i0.ɵɵnextContext();
    const b_r2: any = i0.ɵɵreadContextLet(0);
    i0.ɵɵnextContext();
    const a_r3: any = i0.ɵɵreadContextLet(0);
    return i0.ɵɵresetView(a_r3 + b_r2 + c_r1);
  };
function TestComp_Conditional_1_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵtext(1);
  }
  if (rf & 2) {
    i0.ɵɵstoreLet(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(' ', i0.ɵɵarrowFunction(2, arrowFn0, ctx)(), ' ');
  }
}
function TestComp_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, TestComp_Conditional_1_Conditional_1_Template, 2, 3);
  }
  if (rf & 2) {
    i0.ɵɵstoreLet(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(true ? 1 : -1);
  }
}

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
        @let a = 1;

        @if (true) {
          @let b = 2;

          @if (true) {
            @let c = 3;
            {{(() => a + b + c)()}}
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
      filePath: 'arrow_function_let_nested.ts',
      lineNumber: 17,
    });
})();

```