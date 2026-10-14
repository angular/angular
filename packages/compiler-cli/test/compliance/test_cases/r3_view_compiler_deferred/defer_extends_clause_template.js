import { Component } from "@angular/core";
import { DeferDep, BaseCmp } from "./defer_extends_clause_deps";
import * as i0 from "@angular/core";
const MyApp_Defer_1_DepsFn = () => [DeferDep];
function MyApp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "defer-dep");
  }
}
export class MyApp extends BaseCmp {
  static ɵfac = /*@__PURE__*/ (() => {
    let ɵMyApp_BaseFactory;
    return function MyApp_Factory(__ngFactoryType__) {
      return (ɵMyApp_BaseFactory || (ɵMyApp_BaseFactory = i0.ɵɵgetInheritedFactory(MyApp)))(
        __ngFactoryType__ || MyApp
      );
    };
  })();
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    features: [i0.ɵɵInheritDefinitionFeature],
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
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @defer {
      <defer-dep/>
    }
  `,
              imports: [DeferDep]
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
      filePath: "defer_extends_clause.ts",
      lineNumber: 12
    });
})();
