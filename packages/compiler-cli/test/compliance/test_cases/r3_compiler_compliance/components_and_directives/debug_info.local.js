import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class Main {
  static ɵfac = function Main_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Main)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Main,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 0,
    template: function Main_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "Hello Angular!");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Main,
      [
        {
          type: Component,
          args: [
            {
              template: "Hello Angular!"
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
    i0.ɵsetClassDebugInfo(Main, { className: "Main", filePath: "debug_info.ts", lineNumber: 6 });
})();
export class MainStandalone {
  static ɵfac = function MainStandalone_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MainStandalone)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MainStandalone,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 0,
    template: function MainStandalone_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "Hello Angular!");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MainStandalone,
      [
        {
          type: Component,
          args: [
            {
              template: "Hello Angular!"
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
    i0.ɵsetClassDebugInfo(MainStandalone, {
      className: "MainStandalone",
      filePath: "debug_info.ts",
      lineNumber: 12
    });
})();
