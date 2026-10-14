import { Component, HostListener } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  start() {}
  click() {}
  mousedown() {}
  done() {}
  mouseup() {}
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
        i0.ɵɵlistener("mousedown", function MyComponent_mousedown_HostBindingHandler() {
          return ctx.mousedown();
        })("mouseup", function MyComponent_mouseup_HostBindingHandler() {
          return ctx.mouseup();
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
              selector: "my-comp",
              template: "",
              host: {
                "(mousedown)": "mousedown()",
                "(@animation.done)": "done()",
                "(mouseup)": "mouseup()"
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
        ],
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
      filePath: "chain_synthetic_listeners_mixed.ts",
      lineNumber: 13
    });
})();
