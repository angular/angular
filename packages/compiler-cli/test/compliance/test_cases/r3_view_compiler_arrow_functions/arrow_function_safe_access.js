import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => value => value?.a?.b?.c?.()?.()?.()?.();
const arrowFn1 = (ctx, view) => () => ctx.componentProp?.a?.b?.c?.()?.()?.()?.();
export class TestComp {
  componentProp = {};
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 4,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomElement(1, "hr");
        i0.ɵɵtext(2);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", i0.ɵɵarrowFunction(2, arrowFn0, ctx)(ctx.componentProp), " ");
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", i0.ɵɵarrowFunction(3, arrowFn1, ctx), " ");
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
    {{(value => value?.a?.b?.c?.()?.()?.()?.())(componentProp)}}
    <hr>
    {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
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
      filePath: "arrow_function_safe_access.ts",
      lineNumber: 10
    });
})();
