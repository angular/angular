// This test verifies that a directive from an external library is emitted using its declared name,
// even in the presence of alias exports that could have been chosen.
// See https://github.com/angular/angular/issues/41277.
import { Component, NgModule } from "@angular/core";
import { LibModule } from "external_library";
import * as i0 from "@angular/core";
import * as i1 from "external_library";
export class TestComponent {
  static ɵfac = function TestComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function TestComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "lib-dir");
      }
    },
    dependencies: [i1.LibDirective],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestComponent,
      [
        {
          type: Component,
          args: [
            {
              template: `
    <lib-dir></lib-dir>
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
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: "TestComponent",
      filePath: "library_exports.ts",
      lineNumber: 13
    });
})();
export class TestModule {
  static ɵfac = function TestModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TestModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [LibModule] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestModule,
      [
        {
          type: NgModule,
          args: [
            {
              declarations: [TestComponent],
              imports: [LibModule]
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
    i0.ɵɵsetNgModuleScope(TestModule, { declarations: [TestComponent], imports: [LibModule] });
})();
