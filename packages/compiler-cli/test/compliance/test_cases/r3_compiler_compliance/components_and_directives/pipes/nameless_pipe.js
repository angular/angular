import { Pipe } from "@angular/core";
import * as i0 from "@angular/core";
// TODO(crisbeto): remove `null!` from the pipes when public API is updated.
export class PipeWithoutName {
  transform(value) {
    return value;
  }
  static ɵfac = function PipeWithoutName_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PipeWithoutName)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "PipeWithoutName",
    type: PipeWithoutName,
    pure: true
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      PipeWithoutName,
      [
        {
          type: Pipe,
          args: [null]
        }
      ],
      null,
      null
    );
})();
