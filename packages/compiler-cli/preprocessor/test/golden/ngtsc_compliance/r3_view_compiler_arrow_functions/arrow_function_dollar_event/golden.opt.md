# /out/arrow_function_dollar_event.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_dollar_event.ts
 * @generated
 */

import * as i0 from './arrow_function_dollar_event';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    const _t1 /*86,97*/ = 1 /*100,101*/; /*81,102*/
    if (true /*113,117*/) {
      const _t2 /*132,140*/ = 2 /*143,144*/; /*127,145*/
      var _t3 /*153,254*/ = document.createElement('button'); /*153,254*/ /*153,254*/
      _t3.addEventListener(/*162,167*/ 'click', ($event /*T:EP*/): any => {
        if (true /*D:ignore*/ /*113,117*/) {
          this.signal /*170,176*/ /*170,176*/
            .update(
              /*177,183*/ (prev) /*D:ignore*/ =>
                $event /*192,198*/.type /*199,203*/ /*192,203*/ +
                prev /*206,210*/ /*192,210*/ +
                _t2 /*213,221*/ /*192,221*/ +
                _t1 /*224,235*/ /*192,235*/ +
                this.componentProp /*238,251*/ /*238,251*/ /*192,251*/,
            ) /*170,252*/;
        }
      }) /*161,253*/;
    }
  }
}

```

# /out/arrow_function_dollar_event.ts
```ts
import { Component, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestComp_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵdomElementStart(1, 'button', 0);
    i0.ɵɵdomListener(
      'click',
      function TestComp_Conditional_1_Template_button_click_1_listener($event: any): any {
        i0.ɵɵrestoreView(_r1);
        const innerLet_r2: any = i0.ɵɵreadContextLet(0);
        const ctx_r2: any = i0.ɵɵnextContext();
        const topLevelLet_r4: any = i0.ɵɵreadContextLet(0);
        return i0.ɵɵresetView(
          ctx_r2.signal.update(
            (prev: any): any =>
              $event.type + prev + innerLet_r2 + topLevelLet_r4 + ctx_r2.componentProp,
          ),
        );
      },
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵstoreLet(2);
  }
}

export class TestComp {
  componentProp = 0;
  result = signal(
    '',
    ...((ngDevMode ? [{ debugName: 'result' }] : /* istanbul ignore next */ []) as []),
  );
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
    consts: [[3, 'click']],
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵconditionalCreate(1, TestComp_Conditional_1_Template, 2, 1, 'button');
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
          @let innerLet = 2;

          <button (click)="signal.update(prev => $event.type + prev + innerLet + topLevelLet + componentProp)"></button>
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
      filePath: 'arrow_function_dollar_event.ts',
      lineNumber: 14,
    });
})();

```