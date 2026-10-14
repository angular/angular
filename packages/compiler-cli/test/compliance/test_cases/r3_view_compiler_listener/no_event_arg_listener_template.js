import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  onClick() {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [[3, "click"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() {
          return ctx.onClick();
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
      MyComponent,
      [
        {
          type: Component,
          args: [
            {
              template: `<div (click)="onClick();"></div>`,
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "no_event_arg_listener.ts",
      lineNumber: 7
    });
})();
