import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class MyDirective {
  myTitle = "hello";
  myId = "special-directive";
  static ɵfac = function MyDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [["", "my-dir", ""]],
    hostVars: 3,
    hostBindings: function MyDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵattribute("title", ctx.myTitle)("tabindex", 1)("id", ctx.myId);
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
              host: { "[attr.title]": "myTitle", "[attr.tabindex]": "1", "[attr.id]": "myId" },
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
