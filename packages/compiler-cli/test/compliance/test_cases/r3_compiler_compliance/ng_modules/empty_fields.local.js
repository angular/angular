import { NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class FooModule {
  static ɵfac = function FooModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FooModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      FooModule,
      [
        {
          type: NgModule,
          args: [
            {
              providers: [],
              declarations: [],
              imports: []
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
    i0.ɵɵsetNgModuleScope(FooModule, { declarations: [], imports: [] });
})();
