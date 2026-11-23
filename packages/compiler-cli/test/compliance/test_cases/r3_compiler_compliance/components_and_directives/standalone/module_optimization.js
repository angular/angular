import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class StandaloneCmp {
  static ɵfac = function StandaloneCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || StandaloneCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneCmp,
    selectors: [["standalone-cmp"]],
    decls: 0,
    vars: 0,
    template: function StandaloneCmp_Template(rf, ctx) {},
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
              selector: "standalone-cmp",
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
    i0.ɵsetClassDebugInfo(StandaloneCmp, {
      className: "StandaloneCmp",
      filePath: "module_optimization.ts",
      lineNumber: 7
    });
})();
export class StandaloneDir {
  static ɵfac = function StandaloneDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || StandaloneDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: StandaloneDir });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      StandaloneDir,
      [
        {
          type: Directive,
          args: [{}]
        }
      ],
      null,
      null
    );
})();
export class Module {
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
          args: [
            {
              imports: [StandaloneCmp, StandaloneDir]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(Module, { imports: [StandaloneCmp, StandaloneDir] });
})();
