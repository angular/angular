import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  value = 0;
  callback(value) {
    console.log(value);
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 4,
    vars: 3,
    consts: [[3, "click"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = i0.ɵɵgetCurrentView();
        i0.ɵɵtext(0);
        i0.ɵɵdeclareLet(1);
        i0.ɵɵtext(2);
        i0.ɵɵdomElementStart(3, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_3_listener() {
          i0.ɵɵrestoreView(_r1);
          const three_r2 = i0.ɵɵreadContextLet(1);
          return i0.ɵɵresetView(ctx.callback(three_r2));
        });
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", ctx.value, " ");
        const one_r3 = ctx.value + 1;
        const two_r4 = one_r3 + 1;
        i0.ɵɵadvance();
        const three_r5 = i0.ɵɵstoreLet(two_r4 + 1);
        three_r5 + 1;
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
    <button (click)="callback(three)"></button>
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
      filePath: "let_optimization_listener.ts",
      lineNumber: 14
    });
})();
