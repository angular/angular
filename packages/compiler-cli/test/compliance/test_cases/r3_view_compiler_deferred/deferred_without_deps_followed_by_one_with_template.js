import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
const MyApp_Defer_5_DepsFn = () => [LazyDep];
function MyApp_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " I'm so independent! ");
  }
}
function MyApp_Defer_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "lazy-dep");
  }
}
export class LazyDep {
  static ɵfac = function LazyDep_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LazyDep)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: LazyDep, selectors: [["lazy-dep"]] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      LazyDep,
      [
        {
          type: Directive,
          args: [
            {
              selector: "lazy-dep"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 7,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 0);
        i0.ɵɵdefer(2, 1);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(4, MyApp_Defer_4_Template, 1, 0);
        i0.ɵɵdefer(5, 4, MyApp_Defer_5_DepsFn);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵelementEnd();
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
    <div>
      @defer {
        I'm so independent!
      }
      @defer {
        <lazy-dep/>
      }
    </div>
  `,
              imports: [LazyDep]
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
      filePath: "deferred_without_deps_followed_by_one_with.ts",
      lineNumber: 22
    });
})();
