import { Injectable } from "@angular/core";
import * as i0 from "@angular/core";
class SomeDep {}
class MyAlternateService {
  constructor(dep) {}
  static ɵfac = function MyAlternateService_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyAlternateService)(i0.ɵɵinject(SomeDep));
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyAlternateService,
    factory: MyAlternateService.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyAlternateService,
      [
        {
          type: Injectable
        }
      ],
      () => [{ type: SomeDep }],
      null
    );
})();
export class MyService {
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyService)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyService,
    factory: function MyService_Factory(__ngFactoryType__) {
      let __ngConditionalFactory__ = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new __ngFactoryType__();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = new MyAlternateService(i0.ɵɵinject(SomeDep));
      }
      return __ngConditionalFactory__;
    },
    providedIn: "root"
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyService,
      [
        {
          type: Injectable,
          args: [{ providedIn: "root", useClass: MyAlternateService, deps: [SomeDep] }]
        }
      ],
      null,
      null
    );
})();
