import { Component } from "@angular/core";
import { EagerDep } from "./deferred_with_external_deps_eager";
import { LoadingDep } from "./deferred_with_external_deps_loading";
import * as i0 from "@angular/core";
const MyApp_Defer_4_DepsFn = () => [
  /* @ts-ignore */ import("./deferred_with_external_deps_lazy").then(m => m.LazyDep)
];
function MyApp_Defer_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "lazy-dep");
  }
}
function MyApp_DeferLoading_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "loading-dep");
  }
}
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 6,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵelement(1, "eager-dep");
        i0.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 1, 0)(3, MyApp_DeferLoading_3_Template, 1, 0);
        i0.ɵɵdefer(4, 2, MyApp_Defer_4_DepsFn, 3);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [EagerDep, LoadingDep],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadataAsync(
      MyApp,
      () => [/* @ts-ignore */ import("./deferred_with_external_deps_lazy").then(m => m.LazyDep)],
      LazyDep => {
        i0.ɵsetClassMetadata(
          MyApp,
          [
            {
              type: Component,
              args: [
                {
                  template: `
    <div>
      <eager-dep/>
      @defer {
        <lazy-dep/>
      } @loading {
        <loading-dep/>
      }
    </div>
  `,
                  imports: [EagerDep, LazyDep, LoadingDep]
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
      filePath: "deferred_with_external_deps.ts",
      lineNumber: 20
    });
})();
