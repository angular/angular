# /out/arrow_function_defined_let.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_defined_let.ts
 * @generated
 */

import * as i0 from './arrow_function_defined_let';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    const _t1 /*78,80*/ = (a /*D:ignore*/, b /*D:ignore*/) =>
      this.componentValue /*93,107*/ /*93,107*/ +
      a /*110,111*/ /*93,111*/ +
      b /*114,115*/ /*93,115*/; /*73,116*/
    '' + _t1(/*124,126*/ 0 /*127,128*/, 1 /*130,131*/) /*124,132*/;
    if (true /*149,153*/) {
      '' + _t1(/*164,166*/ 1 /*167,168*/, 1 /*170,171*/) /*164,172*/;
      var _t2 /*188,232*/ = document.createElement('button'); /*188,232*/ /*188,232*/
      _t2.addEventListener(/*197,202*/ 'click', ($event /*T:EP*/): any => {
        if (true /*D:ignore*/ /*149,153*/) {
          this.componentValue /*205,219*/ /*205,219*/ = _t1(
            /*222,224*/ 2 /*225,226*/,
            1 /*228,229*/,
          ) /*222,230*/ /*205,230*/;
        }
      }) /*196,231*/;
    }
  }
}

```

# /out/arrow_function_defined_let.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const arrowFn0 =
  (ctx: any, view: any): any =>
  (a: any, b: any): any =>
    ctx.componentValue + a + b;
function TestComp_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵtext(0);
    i0.ɵɵdomElementStart(1, 'button', 0);
    i0.ɵɵdomListener(
      'click',
      function TestComp_Conditional_2_Template_button_click_1_listener(): any {
        i0.ɵɵrestoreView(_r1);
        const ctx_r1: any = i0.ɵɵnextContext();
        const fn_r3: any = i0.ɵɵreadContextLet(0);
        return i0.ɵɵresetView((ctx_r1.componentValue = fn_r3(2, 1)));
      },
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const fn_r3: any = i0.ɵɵreadContextLet(0);
    i0.ɵɵtextInterpolate1(' Two: ', fn_r3(1, 1), ' ');
  }
}

export class TestComp {
  componentValue = 0;
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
    consts: [[3, 'click']],
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, TestComp_Conditional_2_Template, 2, 1);
      }
      if (rf & 2) {
        const fn_r4: any = i0.ɵɵstoreLet(i0.ɵɵarrowFunction(2, arrowFn0, ctx));
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' One: ', fn_r4(0, 1), ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(true ? 2 : -1);
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
        @let fn = (a, b) => componentValue + a + b;
        One: {{fn(0, 1)}}

        @if (true) {
          Two: {{fn(1, 1)}}

          <button (click)="componentValue = fn(2, 1)"></button>
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
      filePath: 'arrow_function_defined_let.ts',
      lineNumber: 15,
    });
})();

```