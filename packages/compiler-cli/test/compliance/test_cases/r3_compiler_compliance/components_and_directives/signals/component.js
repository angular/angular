import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class OtherCmp {
  static ɵfac = function OtherCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || OtherCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OtherCmp,
    selectors: [["other-cmp"]],
    signals: true,
    decls: 0,
    vars: 0,
    template: function OtherCmp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      OtherCmp,
      [
        {
          type: Component,
          args: [
            {
              // @ts-ignore
              signals: true,
              selector: "other-cmp",
              template: ""
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
    i0.ɵsetClassDebugInfo(OtherCmp, {
      className: "OtherCmp",
      filePath: "component.ts",
      lineNumber: 9
    });
})();
export class SignalCmp {
  static ɵfac = function SignalCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SignalCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SignalCmp,
    selectors: [["ng-component"]],
    signals: true,
    decls: 1,
    vars: 0,
    template: function SignalCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "other-cmp");
      }
    },
    dependencies: [OtherCmp],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SignalCmp,
      [
        {
          type: Component,
          args: [
            {
              // @ts-ignore
              signals: true,
              template: "<other-cmp></other-cmp>",
              imports: [OtherCmp]
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
    i0.ɵsetClassDebugInfo(SignalCmp, {
      className: "SignalCmp",
      filePath: "component.ts",
      lineNumber: 18
    });
})();
