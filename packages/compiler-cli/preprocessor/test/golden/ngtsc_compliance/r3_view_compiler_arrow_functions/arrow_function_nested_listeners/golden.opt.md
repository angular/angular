# /out/arrow_function_nested_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_nested_listeners.ts
 * @generated
 */

import * as i0 from './arrow_function_nested_listeners';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    const _t1 /*86,87*/ = 1 /*90,91*/; /*81,92*/
    if (true /*103,107*/) {
      var _t5 /*117,127*/ = document.createElement('input'); /*117,127*/ /*117,127*/
      var _t4 /*125,126*/ = _t5; /*124,126*/
      if (true /*140,144*/) {
        const _t2 /*161,162*/ = 3 /*165,166*/; /*156,167*/
        var _t3 /*177,256*/ = document.createElement('button'); /*177,256*/ /*177,256*/
        _t3.addEventListener(/*186,191*/ 'click', ($event /*T:EP*/): any => {
          if (true /*D:ignore*/ /*103,107*/ && true /*D:ignore*/ /*140,144*/) {
            this.someSignal(
              /*194,204*/ (prev) /*D:ignore*/ =>
                prev /*215,219*/ +
                _t1 /*222,223*/ /*215,223*/ +
                _t4 /*226,227*/.value /*228,233*/ /*226,233*/ /*215,233*/ +
                _t2 /*236,237*/ /*215,237*/ +
                this.componentProp /*240,253*/ /*240,253*/ /*215,253*/,
            ) /*194,254*/;
          }
        }) /*185,255*/;
      }
    }
  }
}

```

# /out/arrow_function_nested_listeners.ts
```ts
import { Component, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestComp_Conditional_1_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵdomElementStart(1, 'button', 1);
    i0.ɵɵdomListener(
      'click',
      function TestComp_Conditional_1_Conditional_2_Template_button_click_1_listener(): any {
        i0.ɵɵrestoreView(_r1);
        const c_r2: any = i0.ɵɵreadContextLet(0);
        i0.ɵɵnextContext();
        const b_r3: any = i0.ɵɵreference(1);
        const ctx_r3: any = i0.ɵɵnextContext();
        const a_r5: any = i0.ɵɵreadContextLet(0);
        return i0.ɵɵresetView(
          ctx_r3.someSignal(
            (prev: any): any => prev + a_r5 + b_r3.value + c_r2 + ctx_r3.componentProp,
          ),
        );
      },
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵstoreLet(3);
  }
}
function TestComp_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElement(0, 'input', null, 0);
    i0.ɵɵconditionalCreate(2, TestComp_Conditional_1_Conditional_2_Template, 2, 1, 'button');
  }
  if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(true ? 2 : -1);
  }
}

export class TestComp {
  someSignal = signal(
    '',
    ...((ngDevMode ? [{ debugName: 'someSignal' }] : /* istanbul ignore next */ []) as []),
  );
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
    consts: [
      ['b', ''],
      [3, 'click'],
    ],
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵconditionalCreate(1, TestComp_Conditional_1_Template, 3, 1);
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
          <input #b>

          @if (true) {
            @let c = 3;

            <button (click)="someSignal((prev) => prev + a + b.value + c + componentProp)"></button>
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
      filePath: 'arrow_function_nested_listeners.ts',
      lineNumber: 18,
    });
})();

```