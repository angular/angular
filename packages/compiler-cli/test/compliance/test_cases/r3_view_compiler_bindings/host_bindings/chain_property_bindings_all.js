import { Directive, HostBinding } from "@angular/core";
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
        i0.ɵɵdomProperty("tabIndex", 1)("title", ctx.myTitle)("id", ctx.myId);
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
              host: { "[tabindex]": "1" },
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myTitle: [
          {
            type: HostBinding,
            args: ["title"]
          }
        ],
        myId: [
          {
            type: HostBinding,
            args: ["id"]
          }
        ]
      }
    );
})();
