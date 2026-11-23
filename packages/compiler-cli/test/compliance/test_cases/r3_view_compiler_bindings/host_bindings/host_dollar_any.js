import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class HostBindingDir {
  static ɵfac = function HostBindingDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingDir)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostBindingDir,
    selectors: [["", "hostBindingDir", ""]],
    hostVars: 2,
    hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleProp("color", "red");
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function HostBindingDir_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingDir,
      [
        {
          type: Component,
          args: [
            {
              selector: "[hostBindingDir]",
              host: {
                "[style.color]": '$any("red")'
              },
              template: ``,
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(HostBindingDir, {
      className: "HostBindingDir",
      filePath: "host_dollar_any.ts",
      lineNumber: 11
    });
})();
