import { Component, model } from "@angular/core";
import * as i0 from "@angular/core";
export class TestComp {
  counter = model(
    0 /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "counter" }] : /* istanbul ignore next */ [])
  );
  name = model.required(
    /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    inputs: { counter: [1, "counter"], name: [1, "name"] },
    outputs: { counter: "counterChange", name: "nameChange" },
    decls: 1,
    vars: 0,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "Works");
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
              template: "Works"
            }
          ]
        }
      ],
      null,
      {
        counter: [
          { type: i0.Input, args: [{ isSignal: true, alias: "counter", required: false }] },
          { type: i0.Output, args: ["counterChange"] }
        ],
        name: [
          { type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] },
          { type: i0.Output, args: ["nameChange"] }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: "TestComp",
      filePath: "model_component_definition.ts",
      lineNumber: 6
    });
})();
