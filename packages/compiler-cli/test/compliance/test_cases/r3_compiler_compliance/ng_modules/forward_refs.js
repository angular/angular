import { NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export function provideModule() {
  return { ngModule: ForwardModule };
}
export class TestModule {
  static ɵfac = function TestModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: TestModule,
    imports: () => [ForwardModule]
  });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [provideModule()] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestModule,
      [
        {
          type: NgModule,
          args: [{ imports: [provideModule()] }]
        }
      ],
      null,
      null
    );
})();
export class ForwardModule {
  static ɵfac = function ForwardModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ForwardModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ForwardModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ForwardModule,
      [
        {
          type: NgModule
        }
      ],
      null,
      null
    );
})();
