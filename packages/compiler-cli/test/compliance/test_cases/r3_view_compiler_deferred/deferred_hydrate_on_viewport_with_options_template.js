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
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 4,
    vars: 1,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 1);
        i0.ɵɵenableIncrementalHydrationRuntime();
        i0.ɵɵdefer(2, 1, null, null, null, null, null, null, null, 1);
        i0.ɵɵdeferHydrateOnViewport({ rootMargin: "123px", scrollMargin: "456px", threshold: 59 });
        i0.ɵɵdeferOnIdle();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
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
    @defer (hydrate on viewport({rootMargin: '123px', scrollMargin: '456px', threshold: 59})) {
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
      filePath: "deferred_hydrate_on_viewport_with_options.ts",
      lineNumber: 11
    });
})();
