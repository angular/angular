import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  val = null;
  foo(val) {
    return val;
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 4,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵtextInterpolate4(
          " ",
          ctx.val == null ? null : ctx.val.foo.bar,
          " ",
          ctx.val == null ? null : ctx.val[0].foo.bar,
          " ",
          (tmp_0_0 = ctx.foo(ctx.val)) == null ? null : tmp_0_0.foo.bar,
          " ",
          ctx.val == null ? null : ctx.val.foo.bar,
          " "
        );
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
    {{ val?.foo!.bar }}
    {{ val?.[0].foo!.bar }}
    {{ foo(val)?.foo!.bar }}
    {{ $any(val)?.foo!.bar }}
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
      filePath: "safe_access_non_null_use_null.ts",
      lineNumber: 12
    });
})();
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] });
})();
