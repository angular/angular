import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  constructor() {
    this.firstName = null;
    this.lastName = null;
    this.lastNameFallback = "Baggins";
  }
}
MyApp.ɵfac = function MyApp_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyApp)();
};
MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  standalone: false,
  decls: 2,
  vars: 2,
  consts: [[3, "title"]],
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelement(0, "div", 0)(1, "span", 0);
    }
    if (rf & 2) {
      i0.ɵɵproperty("title", "Hello, " + (ctx.firstName ?? "Frodo") + "!");
      i0.ɵɵadvance();
      i0.ɵɵproperty(
        "title",
        "Your last name is " + (ctx.lastName ?? ctx.lastNameFallback ?? "unknown")
      );
    }
  },
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
              template: `
    <div [title]="'Hello, ' + (firstName ?? 'Frodo') + '!'"></div>
    <span [title]="'Your last name is ' + (lastName ?? lastNameFallback ?? 'unknown')"></span>
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
      filePath: "nullish_coalescing_property.ts",
      lineNumber: 11
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
