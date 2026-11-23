import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  p = null;
  f1() {}
  f2() {}
  f3() {}
  f4() {}
  f5() {}
  f6() {}
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 8,
    vars: 4,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "span");
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "span");
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, "span");
        i0.ɵɵtext(5);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(6, "span");
        i0.ɵɵtext(7);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1("Safe Property with Calls: ", ctx.p()?.a()?.b()?.c()?.d());
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          "Safe and Unsafe Property with Calls: ",
          ctx.p?.a()?.b().c().d()?.e()?.f?.g.h?.i()?.j()?.k().l
        );
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1("Nested Safe with Calls: ", ctx.f1()?.[ctx.f2()?.a]?.b);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          "Deep Nested Safe with Calls: ",
          ctx.f1()?.[ctx.f2()?.f3()?.[ctx.f4()?.f5()]]?.f6()
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
  <span>Safe Property with Calls: {{ p()?.a()?.b()?.c()?.d() }}</span>
  <span>Safe and Unsafe Property with Calls: {{ p?.a()?.b().c().d()?.e()?.f?.g.h?.i()?.j()?.k().l }}</span>
  <span>Nested Safe with Calls: {{ f1()?.[f2()?.a]?.b }}</span>
  <span>Deep Nested Safe with Calls: {{ f1()?.[f2()?.f3()?.[f4()?.f5()]]?.f6() }}</span>
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
      filePath: "safe_access_temporaries.ts",
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
