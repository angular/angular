import { Component, signal } from "@angular/core";
import * as i0 from "@angular/core";
function TestComp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵdomElementStart(1, "button", 0);
    i0.ɵɵdomListener(
      "click",
      function TestComp_Conditional_1_Template_button_click_1_listener($event) {
        i0.ɵɵrestoreView(_r1);
        const innerLet_r2 = i0.ɵɵreadContextLet(0);
        const ctx_r2 = i0.ɵɵnextContext();
        const topLevelLet_r4 = i0.ɵɵreadContextLet(0);
        return i0.ɵɵresetView(
          ctx_r2.signal.update(
            prev => $event.type + prev + innerLet_r2 + topLevelLet_r4 + ctx_r2.componentProp
          )
        );
      }
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵstoreLet(2);
  }
}
export class TestComp {
  componentProp = 0;
  result = signal(
    "" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "result" }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 2,
    consts: [[3, "click"]],
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵconditionalCreate(1, TestComp_Conditional_1_Template, 2, 1, "button");
      }
      if (rf & 2) {
        i0.ɵɵstoreLet(1);
        i0.ɵɵadvance();
        i0.ɵɵconditional(true ? 1 : -1);
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
    @let topLevelLet = 1;

    @if (true) {
      @let innerLet = 2;

      <button (click)="signal.update(prev => $event.type + prev + innerLet + topLevelLet + componentProp)"></button>
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
    i0.ɵsetClassDebugInfo(TestComp, {
      className: "TestComp",
      filePath: "arrow_function_dollar_event.ts",
      lineNumber: 14
    });
})();
