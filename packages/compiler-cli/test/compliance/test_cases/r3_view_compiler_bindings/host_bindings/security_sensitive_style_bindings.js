import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class HostBindingDir {
  imgUrl = "url(foo.jpg)";
  styles = { backgroundImage: this.imgUrl };
  static ɵfac = function HostBindingDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingDir,
    selectors: [["", "hostBindingDir", ""]],
    hostVars: 4,
    hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleMap(ctx.styles);
        i0.ɵɵstyleProp("background-image", ctx.imgUrl);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[hostBindingDir]",
              host: { "[style.background-image]": "imgUrl", "[style]": "styles" }
            }
          ]
        }
      ],
      null,
      null
    );
})();
