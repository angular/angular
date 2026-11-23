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
      filePath: "self_closing_tags_nested.ts",
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
    decls: 4,
    vars: 0,
    consts: [
      ["title", "a"],
      ["title", "b"]
    ],
    template: function App_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "my-comp", 0);
        i0.ɵɵtext(1, "Before");
        i0.ɵɵelement(2, "my-comp", 1);
        i0.ɵɵtext(3, "After");
        i0.ɵɵelementEnd();
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
              template: `
    <my-comp title="a">Before<my-comp title="b"></my-comp>After</my-comp>
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
    i0.ɵsetClassDebugInfo(App, {
      className: "App",
      filePath: "self_closing_tags_nested.ts",
      lineNumber: 16
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
