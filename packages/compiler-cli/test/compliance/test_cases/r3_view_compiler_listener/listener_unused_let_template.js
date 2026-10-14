import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class TestCmp {
  noop() {}
  static ɵfac = function TestCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 1,
    consts: [[3, "click"]],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "button", 0);
        i0.ɵɵdomListener("click", function TestCmp_Template_button_click_0_listener() {
          return ctx.noop();
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵtext(1);
      }
      if (rf & 2) {
        const foo_r1 = 123;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", foo_r1, " ");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestCmp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @let foo = 123;
    <button (click)="noop()"></button>
    {{foo}}
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: "TestCmp",
      filePath: "listener_unused_let.ts",
      lineNumber: 10
    });
})();
