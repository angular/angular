import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function InnerCmp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " hello ");
  }
}
export class InnerCmp {
  static ɵfac = function InnerCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || InnerCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: InnerCmp,
    selectors: [["inner-cmp"]],
    decls: 3,
    vars: 0,
    template: function InnerCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, InnerCmp_Defer_0_Template, 1, 0);
        i0.ɵɵenableIncrementalHydrationRuntime();
        i0.ɵɵdefer(1, 0, null, null, null, null, null, null, null, 1);
        i0.ɵɵdeferHydrateOnIdle();
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      InnerCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "inner-cmp",
              template: `
    @defer (hydrate on idle) {
      hello
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
    i0.ɵsetClassDebugInfo(InnerCmp, {
      className: "InnerCmp",
      filePath: "defer_nested_hydrate_inner.ts",
      lineNumber: 11
    });
})();
