import { Component, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = () => ({});
const _c1 = () => ({ a: 1, b: 2 });
export class SomeComp {
  prop;
  otherProp;
  static ɵfac = function SomeComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SomeComp,
    selectors: [["some-comp"]],
    inputs: { prop: "prop", otherProp: "otherProp" },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function SomeComp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "some-comp",
              template: "",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        prop: [
          {
            type: Input
          }
        ],
        otherProp: [
          {
            type: Input
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(SomeComp, {
      className: "SomeComp",
      filePath: "constant_object_literals.ts",
      lineNumber: 7
    });
})();
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 4,
    consts: [[3, "prop", "otherProp"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "some-comp", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("prop", i0.ɵɵpureFunction0(2, _c0))("otherProp", i0.ɵɵpureFunction0(3, _c1));
      }
    },
    dependencies: [SomeComp],
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
              template: '<some-comp [prop]="{}" [otherProp]="{a: 1, b: 2}"></some-comp>',
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
      filePath: "constant_object_literals.ts",
      lineNumber: 16
    });
})();
export class MyMod {
  static ɵfac = function MyMod_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyMod)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyMod,
      [
        {
          type: NgModule,
          args: [{ declarations: [SomeComp, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [SomeComp, MyApp] });
})();
