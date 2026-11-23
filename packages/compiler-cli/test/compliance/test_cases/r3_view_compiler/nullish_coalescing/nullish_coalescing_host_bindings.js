import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  constructor() {
    this.firstName = null;
    this.lastName = null;
    this.lastNameFallback = "Baggins";
  }
  logLastName(name) {
    console.log(name);
  }
}
MyApp.ɵfac = function MyApp_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyApp)();
};
MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  hostVars: 1,
  hostBindings: function MyApp_HostBindings(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵlistener("click", function MyApp_click_HostBindingHandler() {
        return ctx.logLastName(ctx.lastName ?? ctx.lastNameFallback ?? "unknown");
      });
    }
    if (rf & 2) {
      i0.ɵɵattribute("first-name", "Hello, " + (ctx.firstName ?? "Frodo") + "!");
    }
  },
  standalone: false,
  decls: 0,
  vars: 0,
  template: function MyApp_Template(rf, ctx) {},
  encapsulation: 2
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-app",
              host: {
                "[attr.first-name]": `'Hello, ' + (firstName ?? 'Frodo') + '!'`,
                "(click)": `logLastName(lastName ?? lastNameFallback ?? 'unknown')`
              },
              template: ``,
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
      filePath: "nullish_coalescing_host.ts",
      lineNumber: 12
    });
})();
export class MyModule {}
MyModule.ɵfac = function MyModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyModule)();
};
MyModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
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
