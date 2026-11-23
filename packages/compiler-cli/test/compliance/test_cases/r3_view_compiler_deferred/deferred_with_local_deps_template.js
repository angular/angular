import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
const MyApp_Defer_4_DepsFn = () => [LazyDep];
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
export class EagerDep {
  static ɵfac = function EagerDep_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || EagerDep)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: EagerDep, selectors: [["eager-dep"]] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      EagerDep,
      [
        {
          type: Directive,
          args: [{ selector: "eager-dep" }]
        }
      ],
      null,
      null
    );
})();
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
          args: [{ selector: "lazy-dep" }]
        }
      ],
      null,
      null
    );
})();
export class LoadingDep {
  static ɵfac = function LoadingDep_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LoadingDep)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: LoadingDep,
    selectors: [["loading-dep"]]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      LoadingDep,
      [
        {
          type: Directive,
          args: [{ selector: "loading-dep" }]
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
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "deferred_with_local_deps.ts",
      lineNumber: 28
    });
})();
