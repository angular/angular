import { Injectable, Optional } from "@angular/core";
import * as i0 from "@angular/core";
class MyDependency {}
class MyOptionalDependency {}
export class MyService {
  constructor(dep, optionalDep) {}
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyService)(
      i0.ɵɵinject(MyDependency),
      i0.ɵɵinject(MyOptionalDependency, 8)
    );
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
      () => [
        { type: MyDependency },
        {
          type: MyOptionalDependency,
          decorators: [
            {
              type: Optional
            }
          ]
        }
      ],
      null
    );
})();
