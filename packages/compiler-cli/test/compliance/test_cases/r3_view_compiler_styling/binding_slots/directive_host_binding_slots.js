import { Directive, HostBinding } from "@angular/core";
import * as i0 from "@angular/core";
export class WidthDirective {
  myWidth = 200;
  myFooClass = true;
  id = "some id";
  title = "some title";
  static ɵfac = function WidthDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || WidthDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: WidthDirective,
    selectors: [["", "myWidthDir", ""]],
    hostVars: 6,
    hostBindings: function WidthDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵdomProperty("id", ctx.id)("title", ctx.title);
        i0.ɵɵstyleProp("width", ctx.myWidth);
        i0.ɵɵclassProp("foo", ctx.myFooClass);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      WidthDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[myWidthDir]",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myWidth: [
          {
            type: HostBinding,
            args: ["style.width"]
          }
        ],
        myFooClass: [
          {
            type: HostBinding,
            args: ["class.foo"]
          }
        ],
        id: [
          {
            type: HostBinding,
            args: ["id"]
          }
        ],
        title: [
          {
            type: HostBinding,
            args: ["title"]
          }
        ]
      }
    );
})();
