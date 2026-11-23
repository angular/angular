import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => (a, b) => ctx.componentValue + a + b;
function TestComp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵtext(0);
    i0.ɵɵdomElementStart(1, "button", 0);
    i0.ɵɵdomListener("click", function TestComp_Conditional_2_Template_button_click_1_listener() {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1 = i0.ɵɵnextContext();
      const fn_r3 = i0.ɵɵreadContextLet(0);
      return i0.ɵɵresetView((ctx_r1.componentValue = fn_r3(2, 1)));
    });
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const fn_r3 = i0.ɵɵreadContextLet(0);
    i0.ɵɵtextInterpolate1(" Two: ", fn_r3(1, 1), " ");
  }
}
export class TestComp {
  componentValue = 0;
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 4,
    consts: [[3, "click"]],
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, TestComp_Conditional_2_Template, 2, 1);
      }
      if (rf & 2) {
        const fn_r4 = i0.ɵɵstoreLet(i0.ɵɵarrowFunction(2, arrowFn0, ctx));
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" One: ", fn_r4(0, 1), " ");
        i0.ɵɵadvance();
        i0.ɵɵconditional(true ? 2 : -1);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
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
  `
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: "TestComp",
      filePath: "arrow_function_defined_let.ts",
      lineNumber: 15
    });
})();
