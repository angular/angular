import { Service } from "@angular/core";
import * as i0 from "@angular/core";
class Alternate {}
export class MyService {
  static ɵfac = function MyService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyService)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineService({
    token: MyService,
    factory: () => (() => new Alternate())()
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyService,
      [
        {
          type: Service,
          args: [{ factory: () => new Alternate() }]
        }
      ],
      null,
      null
    );
})();
