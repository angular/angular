import { Directive, HostListener } from "@angular/core";
import * as i0 from "@angular/core";
export class MyDirective {
  mousedown() {}
  mouseup() {}
  click() {}
  static ɵfac = function MyDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [["", "my-dir", ""]],
    hostBindings: function MyDirective_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵlistener("mousedown", function MyDirective_mousedown_HostBindingHandler() {
          return ctx.mousedown();
        })("mouseup", function MyDirective_mouseup_HostBindingHandler() {
          return ctx.mouseup();
        })("click", function MyDirective_click_HostBindingHandler() {
          return ctx.click();
        });
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[my-dir]",
              host: {
                "(mousedown)": "mousedown()",
                "(mouseup)": "mouseup()"
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
