import { Directive, HostListener } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  click(target) {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyComponent,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵlistener("click", function MyComponent_click_HostBindingHandler($event) {
          return ctx.click($event.target);
        });
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponent,
      [
        {
          type: Directive
        }
      ],
      null,
      {
        click: [
          {
            type: HostListener,
            args: ["click", ["$event.target"]]
          }
        ]
      }
    );
})();
