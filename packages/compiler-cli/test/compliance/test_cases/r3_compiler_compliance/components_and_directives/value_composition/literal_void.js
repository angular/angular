import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = () => [void 0, 1];
const _c1 = () => ({ a: void 0, b: 2 });
export class VoidComp {
  static ɵfac = function VoidComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || VoidComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: VoidComp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 4,
    template: function VoidComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        const array_r1 = i0.ɵɵpureFunction0(2, _c0);
        const object_r2 = i0.ɵɵpureFunction0(3, _c1);
        i0.ɵɵtextInterpolate2(" ", array_r1, " ", object_r2, " ");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      VoidComp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @let array = [void 0, 1];
    @let object = {a: void 0, b: 2};

    <!-- Use the literals so they don't get flagged as unused. -->
    {{array}} {{object}}
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
    i0.ɵsetClassDebugInfo(VoidComp, {
      className: "VoidComp",
      filePath: "literal_void.ts",
      lineNumber: 12
    });
})();
