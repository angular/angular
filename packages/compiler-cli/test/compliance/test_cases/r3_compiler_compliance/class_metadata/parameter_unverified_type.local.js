import { Injectable, Optional } from "@angular/core";
import { SomeService } from "./external";
import * as i0 from "@angular/core";
import * as i1 from "./external";
export class LocalService {}
export class ParameterizedInjectable {
  constructor(local, external, optionalExternal) {}
  static ɵfac = function ParameterizedInjectable_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ParameterizedInjectable)(
      i0.ɵɵinject(LocalService),
      i0.ɵɵinject(i1.SomeService),
      i0.ɵɵinject(i1.SomeService, 8)
    );
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: ParameterizedInjectable,
    factory: ParameterizedInjectable.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ParameterizedInjectable,
      [
        {
          type: Injectable
        }
      ],
      () => [
        { type: LocalService },
        {
          /* @ts-ignore */
          type: i1.SomeService
        },
        {
          /* @ts-ignore */
          type: i1.SomeService,
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
