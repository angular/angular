import { Component, HostListener } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  start() {}
  done() {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-comp"]],
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵsyntheticHostListener(
          "@animation.done",
          function MyComponent_animation_animation_done_HostBindingHandler() {
            return ctx.done();
          }
        )("@animation.start", function MyComponent_animation_animation_start_HostBindingHandler() {
          return ctx.start();
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
              selector: "my-comp",
              template: "",
              host: {
                "(@animation.done)": "done()"
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        start: [
          {
            type: HostListener,
            args: ["@animation.start"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "chain_synthetic_listeners.ts",
      lineNumber: 11
    });
})();
