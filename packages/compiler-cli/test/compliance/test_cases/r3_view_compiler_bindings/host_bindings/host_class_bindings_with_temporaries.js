import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class HostBindingDir {
  constructor() {
    this.value = null;
  }
}
HostBindingDir.ɵfac = function HostBindingDir_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || HostBindingDir)();
};
HostBindingDir.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
  type: HostBindingDir,
  selectors: [["", "hostBindingDir", ""]],
  hostVars: 4,
  hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
    if (rf & 2) {
      i0.ɵɵclassProp("a", ctx.value ?? "class-a")("b", ctx.value ?? "class-b");
    }
  }
});
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
              host: {
                "[class.a]": 'value ?? "class-a"',
                "[class.b]": 'value ?? "class-b"'
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
