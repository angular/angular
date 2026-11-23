import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  foo;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-cmp"]],
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵlistener(
          "dragover",
          function MyComponent_dragover_HostBindingHandler($event) {
            return ctx.foo($event);
          },
          i0.ɵɵresolveDocument
        );
      }
    },
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
              selector: "my-cmp",
              host: {
                "(document:dragover)": "foo($event)"
              },
              template: `
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "host_listeners.ts",
      lineNumber: 11
    });
})();
