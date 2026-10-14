import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import * as i0 from "@angular/core";
export class BasicModule {
  static ɵfac = function BasicModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BasicModule)();
  };
  static ɵmod = (function () {
    i0.ɵɵregisterNgModuleType(BasicModule, "BasicModuleId");
    return /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BasicModule, id: "BasicModuleId" });
  })();
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      BasicModule,
      [
        {
          type: NgModule,
          args: [{ id: "BasicModuleId", schemas: [NO_ERRORS_SCHEMA] }]
        }
      ],
      null,
      null
    );
})();
