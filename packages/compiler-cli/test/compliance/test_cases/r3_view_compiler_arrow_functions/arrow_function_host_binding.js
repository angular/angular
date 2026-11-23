import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => (a, b) => a / b;
const arrowFn1 = (ctx, view) => (a, b) => a / b + ctx.componentProp;
export class TestDir {
  componentProp = 1;
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    hostVars: 4,
    hostBindings: function TestDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵattribute("no-context", i0.ɵɵarrowFunction(2, arrowFn0, ctx)(5, 10))(
          "with-context",
          i0.ɵɵarrowFunction(3, arrowFn1, ctx)(6, 12)
        );
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestDir,
      [
        {
          type: Directive,
          args: [
            {
              host: {
                "[attr.no-context]": "((a, b) => a / b)(5, 10)",
                "[attr.with-context]": "((a, b) => a / b + componentProp)(6, 12)"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
