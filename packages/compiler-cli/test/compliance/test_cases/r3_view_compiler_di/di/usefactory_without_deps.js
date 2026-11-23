import { Injectable } from "@angular/core";
import * as i0 from "@angular/core";
class MyAlternateService {}
function alternateFactory() {
  return new MyAlternateService();
}
export class MyService {
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyService)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyService,
    factory: () => alternateFactory(),
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
          args: [{ providedIn: "root", useFactory: alternateFactory }]
        }
      ],
      null,
      null
    );
})();
