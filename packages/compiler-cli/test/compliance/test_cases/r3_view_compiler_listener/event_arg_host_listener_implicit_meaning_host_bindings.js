import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
class Dir {
  c(event) {}
  static ɵfac = function Dir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Dir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Dir,
    hostBindings: function Dir_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵlistener("click", function Dir_click_HostBindingHandler($event) {
          return ctx.c($event);
        });
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Dir,
      [
        {
          type: Directive,
          args: [
            {
              host: { "(click)": "c($event)" },
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
