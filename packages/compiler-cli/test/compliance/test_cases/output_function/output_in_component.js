import { Component, EventEmitter, output } from "@angular/core";
import { outputFromObservable } from "@angular/core/rxjs-interop";
import * as i0 from "@angular/core";
export class TestComp {
  a = output();
  b = output({});
  c = output({ alias: "cPublic" });
  d = outputFromObservable(new EventEmitter());
  e = outputFromObservable(new EventEmitter());
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    outputs: { a: "a", b: "b", c: "cPublic", d: "d", e: "e" },
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
        a: [{ type: i0.Output, args: ["a"] }],
        b: [{ type: i0.Output, args: ["b"] }],
        c: [{ type: i0.Output, args: ["cPublic"] }],
        d: [{ type: i0.Output, args: ["d"] }],
        e: [{ type: i0.Output, args: ["e"] }]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: "TestComp",
      filePath: "output_in_component.ts",
      lineNumber: 7
    });
})();
