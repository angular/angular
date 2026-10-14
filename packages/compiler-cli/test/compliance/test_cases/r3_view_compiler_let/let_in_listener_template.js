import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  value = 1;
  callback(one, two) {
    console.log(one, two);
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 2,
    consts: [[3, "click"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = i0.ɵɵgetCurrentView();
        i0.ɵɵdeclareLet(0)(1);
        i0.ɵɵdomElementStart(2, "button", 0);
        i0.ɵɵdomListener("click", function MyApp_Template_button_click_2_listener() {
          i0.ɵɵrestoreView(_r1);
          const one_r2 = i0.ɵɵreadContextLet(0);
          const two_r3 = i0.ɵɵreadContextLet(1);
          return i0.ɵɵresetView(ctx.callback(one_r2, two_r3));
        });
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        const one_r4 = i0.ɵɵstoreLet(ctx.value + 1);
        i0.ɵɵadvance();
        i0.ɵɵstoreLet(one_r4 + 1);
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

    <button (click)="callback(one, two)"></button>
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
      filePath: "let_in_listener.ts",
      lineNumber: 11
    });
})();
