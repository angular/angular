import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const MyApp_Defer_1_DepsFn = () => [
  /* @ts-ignore */
  import("./deferred_with_duplicate_external_dep_lazy").then(m => m.DuplicateLazyDep)
];
// NOTE: in linked tests there is one more loader here, because linked compilation doesn't have the ability to de-dupe identical functions.
…
const MyApp_Defer_7_DepsFn = () => [
  /* @ts-ignore */ import("./deferred_with_duplicate_external_dep_other").then(m => m.OtherLazyDep)
];
function MyApp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "duplicate-lazy-dep");
  }
}
function MyApp_Defer_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "duplicate-lazy-dep");
  }
}
function MyApp_Defer_6_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "other-lazy-dep");
  }
}
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 9,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0);
        i0.ɵɵdefer(1, 0, MyApp_Defer_1_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(3, MyApp_Defer_3_Template, 1, 0);
        // NOTE: does not check the function name, because linked compilation doesn't have the ability to de-dupe identical functions.
        i0.ɵɵdefer(4, 3, …);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(6, MyApp_Defer_6_Template, 1, 0);
        i0.ɵɵdefer(7, 6, MyApp_Defer_7_DepsFn);
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
      () => [
        /* @ts-ignore */
        import("./deferred_with_duplicate_external_dep_lazy").then(
          m => m.DuplicateLazyDep
        ) /* @ts-ignore */,
        import("./deferred_with_duplicate_external_dep_other").then(m => m.OtherLazyDep)
      ],
      (DuplicateLazyDep, OtherLazyDep) => {
        i0.ɵsetClassMetadata(
          MyApp,
          [
            {
              type: Component,
              args: [
                {
                  template: `
    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <other-lazy-dep/>
    }
  `,
                  imports: [DuplicateLazyDep, OtherLazyDep]
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
      filePath: "deferred_with_duplicate_external_dep.ts",
      lineNumber: 21
    });
})();
