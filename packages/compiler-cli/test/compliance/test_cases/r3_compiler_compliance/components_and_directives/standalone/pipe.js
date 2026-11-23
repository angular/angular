import { Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class StandalonePipe {
  transform(value) {}
  static ɵfac = function StandalonePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || StandalonePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "stpipe",
    type: StandalonePipe,
    pure: true
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      StandalonePipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "stpipe"
            }
          ]
        }
      ],
      null,
      null
    );
})();
