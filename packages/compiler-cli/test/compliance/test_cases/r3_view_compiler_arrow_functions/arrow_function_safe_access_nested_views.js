import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => () => {
  i0.ɵɵrestoreView(view);
  const ctx_r0 = i0.ɵɵnextContext(3);
  return i0.ɵɵresetView(ctx_r0.componentProp?.a?.b?.c?.()?.()?.()?.());
};
function TestComp_Conditional_0_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵarrowFunction(1, arrowFn0, ctx), " ");
  }
}
function TestComp_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TestComp_Conditional_0_Conditional_0_Conditional_0_Template, 1, 2);
  }
  if (rf & 2) {
    i0.ɵɵconditional(true ? 0 : -1);
  }
}
function TestComp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, TestComp_Conditional_0_Conditional_0_Template, 1, 1);
  }
  if (rf & 2) {
    i0.ɵɵconditional(true ? 0 : -1);
  }
}
export class TestComp {
  componentProp = {};
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 1,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, TestComp_Conditional_0_Template, 1, 1);
      }
      if (rf & 2) {
        i0.ɵɵconditional(true ? 0 : -1);
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
    @if (true) {
      @if (true) {
        @if (true) {
          {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
        }
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
      filePath: "arrow_function_safe_access_nested_views.ts",
      lineNumber: 14
    });
})();
