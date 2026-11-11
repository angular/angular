import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class MyDirective {
  resolve(event) {}
  static ɵfac = function MyDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [["", "myDir", ""]],
    hostBindings: function MyDirective_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵattributeResolver("role", function MyDirective_attr_role_HostBindingHandler($event) {
          return ctx.resolve($event);
        }, 1);
      }
    }
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
              selector: "[myDir]",
              host: { "(attr.role)": "resolve($event)" }
            }
          ]
        }
      ],
      null,
      null
    );
})();
