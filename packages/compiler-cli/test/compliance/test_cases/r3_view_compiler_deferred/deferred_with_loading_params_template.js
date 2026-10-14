import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "button");
  }
}
function MyApp_DeferLoading_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "img", 1);
  }
}
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 4,
    vars: 0,
    consts: [
      [2000, 500],
      ["src", "loading.gif"]
    ],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0)(1, MyApp_DeferLoading_1_Template, 1, 0);
        i0.ɵɵdefer(2, 0, null, 1, null, null, 0, null, i0.ɵɵdeferEnableTimerScheduling);
        i0.ɵɵdeferOnIdle();
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
    @defer {
      <button></button>
    } @loading(minimum 2s; after 500ms) {
      <img src="loading.gif">
    }
  `,
              standalone: false
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
      filePath: "deferred_with_loading_params.ts",
      lineNumber: 13
    });
})();
