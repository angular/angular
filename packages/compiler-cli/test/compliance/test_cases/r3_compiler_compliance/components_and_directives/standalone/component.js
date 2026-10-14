import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class OtherCmp {
  static ɵfac = function OtherCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || OtherCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: OtherCmp,
    selectors: [["other-cmp"]],
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
      lineNumber: 7
    });
})();
export class StandaloneCmp {
  static ɵfac = function StandaloneCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || StandaloneCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneCmp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 0,
    template: function StandaloneCmp_Template(rf, ctx) {
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
      StandaloneCmp,
      [
        {
          type: Component,
          args: [
            {
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
    i0.ɵsetClassDebugInfo(StandaloneCmp, {
      className: "StandaloneCmp",
      filePath: "component.ts",
      lineNumber: 14
    });
})();
