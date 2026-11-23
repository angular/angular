import { Component, signal } from "@angular/core";
import * as i0 from "@angular/core";
export class TestComp {
  sigA = signal(
    1 /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "sigA" }] : /* istanbul ignore next */ [])
  );
  sigB = signal(
    2 /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "sigB" }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 6,
    vars: 0,
    consts: [[3, "click"]],
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "button", 0);
        i0.ɵɵdomListener("click", function TestComp_Template_button_click_0_listener() {
          return ctx.sigA.update(value => value + 1);
        });
        i0.ɵɵtext(1, "Increment A");
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(2, "button", 0);
        i0.ɵɵdomListener("click", function TestComp_Template_button_click_2_listener() {
          return ctx.sigA.update(value => value - 1);
        });
        i0.ɵɵtext(3, "Decrement A");
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(4, "button", 0);
        i0.ɵɵdomListener("click", function TestComp_Template_button_click_4_listener() {
          return ctx.sigB.update(value => value + 1);
        });
        i0.ɵɵtext(5, "Increment B");
        i0.ɵɵdomElementEnd();
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
    <button (click)="sigA.update(value => value + 1)">Increment A</button>
    <button (click)="sigA.update(value => value - 1)">Decrement A</button>
    <button (click)="sigB.update(value => value + 1)">Increment B</button>
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
      filePath: "arrow_function_no_context.ts",
      lineNumber: 10
    });
})();
