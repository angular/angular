import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const MyApp_Defer_1_DepsFn = () => [
  /* @ts-ignore */ import("./defer_nested_hydrate_inner").then(m => m.InnerCmp)
];
function MyApp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "inner-cmp");
  }
}
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    decls: 3,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, MyApp_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadataAsync(
      MyApp,
      () => [/* @ts-ignore */ import("./defer_nested_hydrate_inner").then(m => m.InnerCmp)],
      InnerCmp => {
        i0.ɵsetClassMetadata(
          MyApp,
          [
            {
              type: Component,
              args: [
                {
                  selector: "my-app",
                  imports: [InnerCmp],
                  template: `
    @defer (on idle) {
      <inner-cmp />
    }
  `
                }
              ]
            }
          ],
          null,
          null
        );
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "defer_nested_hydrate.ts",
      lineNumber: 14
    });
})();
