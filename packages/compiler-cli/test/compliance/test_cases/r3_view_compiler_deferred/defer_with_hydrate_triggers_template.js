import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.message, " ");
  }
}
export class MyApp {
  message = "hello";
  isReady = true;
  isVisible() {
    return false;
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 4,
    vars: 2,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 1);
        i0.ɵɵenableIncrementalHydrationRuntime();
        i0.ɵɵdefer(2, 1, null, null, null, null, null, null, null, 1);
        i0.ɵɵdeferHydrateOnIdle();
        i0.ɵɵdeferHydrateOnImmediate();
        i0.ɵɵdeferHydrateOnTimer(1337);
        i0.ɵɵdeferHydrateOnHover();
        i0.ɵɵdeferHydrateOnInteraction();
        i0.ɵɵdeferHydrateOnViewport();
        i0.ɵɵdeferOnIdle();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance(2);
        i0.ɵɵdeferHydrateWhen(ctx.isVisible() || ctx.isReady);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    {{message}}
    @defer (
      hydrate when isVisible() || isReady;
      hydrate on idle, timer(1337);
      hydrate on immediate, hover;
      hydrate on interaction;
      hydrate on viewport) {
      {{message}}
    }
  `
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "defer_with_hydrate_triggers.ts",
      lineNumber: 16
    });
})();
