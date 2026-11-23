import { Injectable, Optional } from "@angular/core";
import * as i0 from "@angular/core";
class SomeDep {}
class MyAlternateService {
  constructor(dep, optional) {}
}
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
        __ngConditionalFactory__ = ((dep, optional) => new MyAlternateService(dep, optional))(
          i0.ɵɵinject(SomeDep),
          i0.ɵɵinject(SomeDep, 8)
        );
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
          args: [
            {
              providedIn: "root",
              useFactory: (dep, optional) => new MyAlternateService(dep, optional),
              deps: [SomeDep, [new Optional(), SomeDep]]
            }
          ]
        }
      ],
      null,
      null
    );
})();
