import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  value = 0;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 2,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵtext(1);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", ctx.value, " ");
        const one_r1 = ctx.value + 1;
        const two_r2 = one_r1 + 1;
        const three_r3 = two_r2 + 1;
        three_r3 + 1;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.value, " ");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    {{value}}
    @let one = value + 1;
    @let two = one + 1;
    @let three = two + 1;
    @let four = three + 1;
    {{value}}
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "let_multiple_optimization.ts",
      lineNumber: 13
    });
})();
