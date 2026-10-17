import { Injectable } from "@angular/core";
import * as i0 from "@angular/core";
class MyAlternateService {
  static ɵfac = function MyAlternateService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyAlternateService)();
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
      null,
      null
    );
})();
export class MyService {
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyService)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyService,
    factory: __ngFactoryType__ => MyAlternateService.ɵfac(__ngFactoryType__),
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
          args: [{ providedIn: "root", useClass: MyAlternateService }]
        }
      ],
      null,
      null
    );
})();
