import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class HostBindingDir {
  static ɵfac = function HostBindingDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingDir,
    selectors: [["", "hostBindingDir", ""]],
    hostAttrs: ["src", "trusted", "srcdoc", "trusted"]
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
              host: { "src": "trusted", "srcdoc": "trusted" }
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class HostBindingDir2 {
  static ɵfac = function HostBindingDir2_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingDir2)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingDir2,
    selectors: [["img"]],
    hostAttrs: ["src", "trusted", "srcdoc", "trusted"]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingDir2,
      [
        {
          type: Directive,
          args: [
            {
              selector: "img",
              host: { "src": "trusted", "srcdoc": "trusted" }
            }
          ]
        }
      ],
      null,
      null
    );
})();
