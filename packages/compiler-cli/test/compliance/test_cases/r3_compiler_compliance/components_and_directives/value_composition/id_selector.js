import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class SomeComponent {
  static ɵfac = function SomeComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SomeComponent,
    selectors: [["", "id", "my-app"]],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function SomeComponent_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "#my-app",
              template: "",
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
    i0.ɵsetClassDebugInfo(SomeComponent, {
      className: "SomeComponent",
      filePath: "id_selector.ts",
      lineNumber: 7
    });
})();
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [SomeComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeComponent] });
})();
