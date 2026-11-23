import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 5,
    vars: 0,
    consts: [
      ["src", i0.ɵɵtrustConstantResourceUrl`https://angular.io/`],
      ["srcdoc", i0.ɵɵtrustConstantHtml`<h1>Angular</h1>`],
      [
        "data",
        i0.ɵɵtrustConstantResourceUrl`https://angular.io/`,
        "codebase",
        i0.ɵɵtrustConstantResourceUrl`/`
      ],
      ["src", "https://angular.io/"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "embed", 0)(1, "iframe", 1)(2, "object", 2)(3, "embed", 0)(4, "img", 3);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-component",
              template: `
    <!-- A couple of security-sensitive attributes with constant values -->
    <embed src="https://angular.io/" />
    <iframe srcdoc="<h1>Angular</h1>"></iframe>
    <object data="https://angular.io/" codebase="/"></object>

    <!-- Repeated element to make sure attribute deduplication works properly -->
    <embed src="https://angular.io/" />

    <!-- Another element with a src attribute that is not security sensitive -->
    <img src="https://angular.io/" />
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "security_sensitive_constant_attributes.ts",
      lineNumber: 19
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
          args: [{ declarations: [MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();
