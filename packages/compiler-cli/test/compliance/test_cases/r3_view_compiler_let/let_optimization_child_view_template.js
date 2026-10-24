import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const three_r1 = i0.ɵɵreadContextLet(1);
    i0.ɵɵtextInterpolate1(" ", three_r1, " ");
  }
}
export class MyApp {
  value = 0;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 4,
    vars: 4,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdeclareLet(1);
        i0.ɵɵtext(2);
        i0.ɵɵconditionalCreate(3, MyApp_Conditional_3_Template, 1, 1);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", ctx.value, " ");
        const one_r2 = ctx.value + 1;
        const two_r3 = one_r2 + 1;
        i0.ɵɵadvance();
        const three_r4 = i0.ɵɵstoreLet(two_r3 + 1);
        three_r4 + 1;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.value, " ");
        i0.ɵɵadvance();
        i0.ɵɵconditional(true ? 3 : -1);
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
    @if (true) {
      {{three}}
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
      filePath: "let_optimization_child_view.ts",
      lineNumber: 16
    });
})();
