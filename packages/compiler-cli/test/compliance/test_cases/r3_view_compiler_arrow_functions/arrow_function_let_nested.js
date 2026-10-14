import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => () => {
  i0.ɵɵrestoreView(view);
  const c_r1 = i0.ɵɵreadContextLet(0);
  i0.ɵɵnextContext();
  const b_r2 = i0.ɵɵreadContextLet(0);
  i0.ɵɵnextContext();
  const a_r3 = i0.ɵɵreadContextLet(0);
  return i0.ɵɵresetView(a_r3 + b_r2 + c_r1);
};
function TestComp_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵtext(1);
  }
  if (rf & 2) {
    i0.ɵɵstoreLet(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵarrowFunction(2, arrowFn0, ctx)(), " ");
  }
}
function TestComp_Conditional_1_Template(rf, ctx) {
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
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 2,
    template: function TestComp_Template(rf, ctx) {
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
    @let a = 1;

    @if (true) {
      @let b = 2;

      @if (true) {
        @let c = 3;
        {{(() => a + b + c)()}}
      }
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
      filePath: "arrow_function_let_nested.ts",
      lineNumber: 17
    });
})();
