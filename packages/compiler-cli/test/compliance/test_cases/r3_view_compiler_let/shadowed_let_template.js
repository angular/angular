import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const value_r1 = "local";
    i0.ɵɵtextInterpolate1(" The value comes from ", value_r1, " ");
  }
}
export class MyApp {
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
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 1, 1);
      }
      if (rf & 2) {
        ("parent");
        i0.ɵɵconditional(true ? 0 : -1);
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
    @let value = 'parent';

    @if (true) {
      @let value = 'local';
      The value comes from {{value}}
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "shadowed_let.ts",
      lineNumber: 13
    });
})();
