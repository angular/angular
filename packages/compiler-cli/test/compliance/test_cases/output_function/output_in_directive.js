import { Directive, EventEmitter, output } from "@angular/core";
import { outputFromObservable } from "@angular/core/rxjs-interop";
import * as i0 from "@angular/core";
export class TestDir {
  a = output();
  b = output({});
  c = output({ alias: "cPublic" });
  d = outputFromObservable(new EventEmitter());
  e = outputFromObservable(new EventEmitter());
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    outputs: { a: "a", b: "b", c: "cPublic", d: "d", e: "e" }
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
        a: [{ type: i0.Output, args: ["a"] }],
        b: [{ type: i0.Output, args: ["b"] }],
        c: [{ type: i0.Output, args: ["cPublic"] }],
        d: [{ type: i0.Output, args: ["d"] }],
        e: [{ type: i0.Output, args: ["e"] }]
      }
    );
})();
