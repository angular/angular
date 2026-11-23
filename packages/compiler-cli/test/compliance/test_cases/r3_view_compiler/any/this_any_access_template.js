import { Component } from "@angular/core";
import * as i0 from "@angular/core";
class Comp {
  $any(value) {
    return value;
  }
  static ɵfac = function Comp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Comp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Comp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[3, "tabIndex"]],
    template: function Comp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("tabIndex", ctx.$any(null));
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Comp,
      [
        {
          type: Component,
          args: [
            {
              template: '<div [tabIndex]="this.$any(null)"></div>',
              standalone: false
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
    i0.ɵsetClassDebugInfo(Comp, {
      className: "Comp",
      filePath: "this_any_access.ts",
      lineNumber: 7
    });
})();
