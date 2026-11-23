import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  value = 1;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 1,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        const one_r1 = ctx.value + 1;
        const two_r2 = one_r1 + 1;
        const result_r3 = two_r2 + 1;
        i0.ɵɵtextInterpolate1(" The result is ", result_r3, " ");
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
    @let one = value + 1;
    @let two = one + 1;
    @let result = two + 1;
    The result is {{result}}
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
      filePath: "multiple_let.ts",
      lineNumber: 11
    });
})();
