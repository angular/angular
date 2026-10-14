import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class SignalDir {
  static ɵfac = function SignalDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SignalDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SignalDir,
    standalone: false,
    signals: true
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SignalDir,
      [
        {
          type: Directive,
          args: [
            {
              // @ts-ignore
              signals: true,
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
