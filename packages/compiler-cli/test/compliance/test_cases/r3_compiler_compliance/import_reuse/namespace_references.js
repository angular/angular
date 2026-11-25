import { Component, Input } from "@angular/core";
import * as directives from "./directives";
import * as i0 from "@angular/core";
export class MyCmp {
  count = 0;
  static ɵfac = function MyCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCmp,
    selectors: [["my-cmp"]],
    inputs: { count: [2, "count", "count", directives.toNumber] },
    decls: 1,
    vars: 0,
    template: function MyCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "badge");
      }
    },
    dependencies: [directives.Badge],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-cmp",
              template: "<badge />",
              imports: [directives.Badge]
            }
          ]
        }
      ],
      null,
      {
        count: [
          {
            type: Input,
            args: [{ transform: directives.toNumber }]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyCmp, {
      className: "MyCmp",
      filePath: "namespace_references.ts",
      lineNumber: 10
    });
})();
