import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const two_r1 = i0.ɵɵreadContextLet(1);
    const three_r2 = two_r1 + 1;
    i0.ɵɵtextInterpolate1(" ", three_r2, " ");
  }
}
function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Conditional_0_Template, 1, 1);
    i0.ɵɵdeclareLet(1);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const one_r3 = i0.ɵɵreadContextLet(1);
    i0.ɵɵconditional(true ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵstoreLet(one_r3 + 1);
  }
}
export class MyApp {
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
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 2);
        i0.ɵɵdeclareLet(1);
      }
      if (rf & 2) {
        i0.ɵɵconditional(true ? 0 : -1);
        i0.ɵɵadvance();
        i0.ɵɵstoreLet(1);
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
    @if (true) {
      @if (true) {
        @let three = two + 1;
        {{three}}
      }
      @let two = one + 1;
    }

    @let one = 1;
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
      filePath: "let_in_child_view.ts",
      lineNumber: 16
    });
})();
