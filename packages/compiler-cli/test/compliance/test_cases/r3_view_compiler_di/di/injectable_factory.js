import { Injectable } from "@angular/core";
import * as i0 from "@angular/core";
class MyDependency {}
export class MyService {
  constructor(dep) {}
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyService)(i0.ɵɵinject(MyDependency));
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyService,
      [
        {
          type: Injectable
        }
      ],
      () => [{ type: MyDependency }],
      null
    );
})();
