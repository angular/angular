import { Directive, input } from "@angular/core";
import * as i0 from "@angular/core";
function convertToBoolean(value) {
  return value === true || value !== "";
}
export class TestDir {
  name = input.required({
    ...(ngDevMode ? { debugName: "name" } : /* istanbul ignore next */ {}),
    transform: convertToBoolean
  });
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: { name: [1, "name"] }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestDir,
      [
        {
          type: Directive,
          args: [{}]
        }
      ],
      null,
      { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }] }
    );
})();
