import { InjectionToken, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const PROVIDERS = [{ provide: new InjectionToken("token"), useValue: 1 }];
export class FooModule {
  static ɵfac = function FooModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FooModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: PROVIDERS });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      FooModule,
      [
        {
          type: NgModule,
          args: [{ providers: PROVIDERS }]
        }
      ],
      null,
      null
    );
})();
