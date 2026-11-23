import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComp {
  static ɵfac = function MyComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [["my-comp"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function MyComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "hello");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-comp",
              template: "hello",
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
    i0.ɵsetClassDebugInfo(MyComp, {
      className: "MyComp",
      filePath: "self_closing_tags.ts",
      lineNumber: 7
    });
})();
export class App {
  static ɵfac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || App)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: App,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function App_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "my-comp");
      }
    },
    dependencies: [MyComp],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      App,
      [
        {
          type: Component,
          args: [
            {
              template: `<my-comp/>`,
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
    i0.ɵsetClassDebugInfo(App, {
      className: "App",
      filePath: "self_closing_tags.ts",
      lineNumber: 14
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
          args: [{ declarations: [App, MyComp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [App, MyComp] });
})();
