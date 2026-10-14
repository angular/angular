import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["*", [["", "spacer", ""]], "*"];
const _c1 = ["*", "[spacer]", "*"];
class Cmp {
  static ɵfac = function Cmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Cmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Cmp,
    selectors: [["ng-component"]],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 3,
    vars: 0,
    template: function Cmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵprojection(0);
        i0.ɵɵprojection(1, 1);
        i0.ɵɵprojection(2, 2);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Cmp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    <ng-content></ng-content>
    <ng-content select="[spacer]"></ng-content>
    <ng-content></ng-content>
  `,
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
    i0.ɵsetClassDebugInfo(Cmp, {
      className: "Cmp",
      filePath: "multiple_wildcards.ts",
      lineNumber: 11
    });
})();
class Module {
  static ɵfac = function Module_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Module)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Module });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Module,
      [
        {
          type: NgModule,
          args: [{ declarations: [Cmp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(Module, { declarations: [Cmp] });
})();
