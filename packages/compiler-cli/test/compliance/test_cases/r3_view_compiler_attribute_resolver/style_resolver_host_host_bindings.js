import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class MyDirective {
  styles(s) {
    return s("height: 2px");
  }
  static ɵfac = function MyDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [["", "myDir", ""]],
    hostAttrs: [2, "width", "1px"],
    hostBindings: function MyDirective_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵattributeResolver(
          "style",
          function MyDirective_style_HostBindingHandler($event) {
            return $event.resolve(ctx.styles($event.resolver));
          },
          3
        );
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
              host: { style: "width: 1px", "(style)": "styles" }
            }
          ]
        }
      ],
      null,
      null
    );
})();
