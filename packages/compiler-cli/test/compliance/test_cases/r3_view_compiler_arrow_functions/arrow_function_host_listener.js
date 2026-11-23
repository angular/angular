import { Directive, signal } from "@angular/core";
import * as i0 from "@angular/core";
export class TestDir {
  someSignal = signal(
    0 /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "someSignal" }] : /* istanbul ignore next */ [])
  );
  componentProp = 1;
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    hostBindings: function TestDir_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵlistener("click", function TestDir_click_HostBindingHandler() {
          return ctx.someSignal.update(prev => prev + 1);
        })("mousedown", function TestDir_mousedown_HostBindingHandler() {
          return ctx.someSignal.update(() => ctx.componentProp + 1);
        });
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
                "(click)": "someSignal.update(prev => prev + 1)",
                "(mousedown)": "someSignal.update(() => componentProp + 1)"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
