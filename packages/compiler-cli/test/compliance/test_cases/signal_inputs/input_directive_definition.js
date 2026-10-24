import { Directive, input } from "@angular/core";
import * as i0 from "@angular/core";
export class TestDir {
  counter = input(
    0 /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "counter" }] : /* istanbul ignore next */ [])
  );
  name = input.required(
    /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: { counter: [1, "counter"], name: [1, "name"] }
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
      {
        counter: [
          { type: i0.Input, args: [{ isSignal: true, alias: "counter", required: false }] }
        ],
        name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }]
      }
    );
})();
