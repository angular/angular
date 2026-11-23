import { Component } from "@angular/core";
import * as i0 from "@angular/core";
class Comp {
  $event = {};
  c(value) {}
  static ɵfac = function Comp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Comp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Comp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [[3, "click"]],
    template: function Comp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵlistener("click", function Comp_Template_div_click_0_listener() {
          return ctx.c(ctx.$event);
        });
        i0.ɵɵelementEnd();
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
              template: '<div (click)="c(this.$event)"></div>',
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
      filePath: "event_explicit_access.ts",
      lineNumber: 7
    });
})();
