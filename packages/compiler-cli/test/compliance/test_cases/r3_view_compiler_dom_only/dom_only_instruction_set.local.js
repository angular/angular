import { Component } from "@angular/core";
import * as i0 from "@angular/core";
// A standalone component with a plain-DOM template and no directive/pipe dependencies.
// Whether it is compiled to the DOM-only instruction set depends solely on the compilation
// mode:
//   - Full compile: the compiler can see that the template has no directive dependencies, so
//     it takes the DOM-only fast path (`ɵɵdomElementStart`/`ɵɵdomElementEnd`).
//   - Local compile: the compiler cannot inspect the component's dependencies, so it assumes
//     directive dependencies may exist and emits the full instruction set
//     (`ɵɵelementStart`/`ɵɵelementEnd`).
export class DomOnlyCmp {
  static ɵfac = function DomOnlyCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DomOnlyCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: DomOnlyCmp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 0,
    template: function DomOnlyCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div")(1, "span");
        i0.ɵɵtext(2, "hi");
        i0.ɵɵelementEnd()();
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DomOnlyCmp,
      [
        {
          type: Component,
          args: [
            {
              standalone: true,
              template: "<div><span>hi</span></div>"
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
    i0.ɵsetClassDebugInfo(DomOnlyCmp, {
      className: "DomOnlyCmp",
      filePath: "dom_only_instruction_set.ts",
      lineNumber: 15
    });
})();
