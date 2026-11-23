import { Component, HostListener } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  mousedown() {}
  click() {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵlistener("mousedown", function MyComponent_mousedown_HostBindingHandler() {
          return ctx.mousedown();
        })("click", function MyComponent_click_HostBindingHandler() {
          return ctx.click();
        });
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
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
              template: "",
              host: {
                "(mousedown)": "mousedown()"
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        click: [
          {
            type: HostListener,
            args: ["click"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "no_event_arg_host_listener.ts",
      lineNumber: 10
    });
})();
