import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => [a0];
const arrowFn0 = (ctx, view) => a => a + 1;
const arrowFn1 = (ctx, view) => a => a + 1 + ctx.componentProp;
export class TestComp {
  componentProp = 0;
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 8,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate2(
          " ",
          i0.ɵɵpureFunction1(4, _c0, i0.ɵɵarrowFunction(2, arrowFn0, ctx))[0](1000),
          " ",
          i0.ɵɵpureFunction1(6, _c0, i0.ɵɵarrowFunction(3, arrowFn1, ctx))[0](1000),
          " "
        );
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
    {{[(a) => a + 1][0](1000)}}
    {{[(a) => a + 1 + componentProp][0](1000)}}
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
      filePath: "arrow_function_inside_pure_value.ts",
      lineNumber: 9
    });
})();
