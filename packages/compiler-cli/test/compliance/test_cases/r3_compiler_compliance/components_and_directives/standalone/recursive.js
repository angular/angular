import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class RecursiveComponent {
  static ɵfac = function RecursiveComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || RecursiveComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: RecursiveComponent,
    selectors: [["recursive-cmp"]],
    decls: 1,
    vars: 0,
    template: function RecursiveComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "recursive-cmp");
      }
    },
    dependencies: [RecursiveComponent],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      RecursiveComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "recursive-cmp",
              // Simple recursion. Note: no `imports`.
              template: "<recursive-cmp></recursive-cmp>"
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
    i0.ɵsetClassDebugInfo(RecursiveComponent, {
      className: "RecursiveComponent",
      filePath: "recursive.ts",
      lineNumber: 8
    });
})();
