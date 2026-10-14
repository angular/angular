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
        ctx.value * 2;
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
    @let result = value * 2;
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
      filePath: "let_single_optimization.ts",
      lineNumber: 10
    });
})();
