import { Component, signal } from "@angular/core";
import * as i0 from "@angular/core";
function TestComp_Conditional_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵdomElementStart(1, "button", 1);
    i0.ɵɵdomListener(
      "click",
      function TestComp_Conditional_1_Conditional_2_Template_button_click_1_listener() {
        i0.ɵɵrestoreView(_r1);
        const c_r2 = i0.ɵɵreadContextLet(0);
        i0.ɵɵnextContext();
        const b_r3 = i0.ɵɵreference(1);
        const ctx_r3 = i0.ɵɵnextContext();
        const a_r5 = i0.ɵɵreadContextLet(0);
        return i0.ɵɵresetView(
          ctx_r3.someSignal(prev => prev + a_r5 + b_r3.value + c_r2 + ctx_r3.componentProp)
        );
      }
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵstoreLet(3);
  }
}
function TestComp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElement(0, "input", null, 0);
    i0.ɵɵconditionalCreate(2, TestComp_Conditional_1_Conditional_2_Template, 2, 1, "button");
  }
  if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(true ? 2 : -1);
  }
}
export class TestComp {
  someSignal = signal(
    "" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "someSignal" }] : /* istanbul ignore next */ [])
  );
  componentProp = 0;
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 2,
    consts: [
      ["b", ""],
      [3, "click"]
    ],
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵconditionalCreate(1, TestComp_Conditional_1_Template, 3, 1);
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
    @let a = 1;

    @if (true) {
      <input #b>

      @if (true) {
        @let c = 3;

        <button (click)="someSignal((prev) => prev + a + b.value + c + componentProp)"></button>
      }
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
      filePath: "arrow_function_nested_listeners.ts",
      lineNumber: 18
    });
})();
