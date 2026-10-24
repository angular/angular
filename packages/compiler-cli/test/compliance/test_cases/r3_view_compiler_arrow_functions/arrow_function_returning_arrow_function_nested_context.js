import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => a => {
  i0.ɵɵrestoreView(view);
  i0.ɵɵnextContext();
  const nestedLet_r1 = i0.ɵɵreadContextLet(0);
  const ctx_r1 = i0.ɵɵnextContext();
  const topLevelLet_r3 = i0.ɵɵreadContextLet(0);
  return i0.ɵɵresetView(
    b => c => d => a + b + c + d + ctx_r1.componentProp + topLevelLet_r3 + nestedLet_r1
  );
};
function TestComp_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵarrowFunction(1, arrowFn0, ctx)(1)(2)(3)(4), " ");
  }
}
function TestComp_Conditional_1_Template(rf, ctx) {
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
    @let topLevelLet = 1;

    @if (true) {
      @let nestedLet = 2;

      @if (true) {
        {{(a => b => c => d => a + b + c + d + componentProp + topLevelLet + nestedLet)(1)(2)(3)(4)}}
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
      filePath: "arrow_function_returning_arrow_function_nested_context.ts",
      lineNumber: 16
    });
})();
