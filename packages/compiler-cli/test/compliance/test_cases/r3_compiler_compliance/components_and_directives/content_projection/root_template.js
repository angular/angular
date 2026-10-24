import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["*"];
const _c1 = [[["span", "title", "tofirst"]], [["span", "title", "tosecond"]]];
const _c2 = ["span[title=toFirst]", "span[title=toSecond]"];
export class SimpleComponent {
  static ɵfac = function SimpleComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SimpleComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleComponent,
    selectors: [["simple"]],
    standalone: false,
    ngContentSelectors: _c0,
    decls: 2,
    vars: 0,
    template: function SimpleComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SimpleComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "simple",
              template: "<div><ng-content></ng-content></div>",
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
    i0.ɵsetClassDebugInfo(SimpleComponent, {
      className: "SimpleComponent",
      filePath: "root_template.ts",
      lineNumber: 7
    });
})();
export class ComplexComponent {
  static ɵfac = function ComplexComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ComplexComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ComplexComponent,
    selectors: [["complex"]],
    standalone: false,
    ngContentSelectors: _c2,
    decls: 4,
    vars: 0,
    consts: [
      ["id", "first"],
      ["id", "second"]
    ],
    template: function ComplexComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c1);
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "div", 1);
        i0.ɵɵprojection(3, 1);
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ComplexComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "complex",
              template: `
    <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
    <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>`,
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
    i0.ɵsetClassDebugInfo(ComplexComponent, {
      className: "ComplexComponent",
      filePath: "root_template.ts",
      lineNumber: 17
    });
})();
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 3,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "simple");
        i0.ɵɵtext(1, "content");
        i0.ɵɵelementEnd();
        i0.ɵɵelement(2, "complex");
      }
    },
    dependencies: [SimpleComponent, ComplexComponent],
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
              selector: "my-app",
              template: "<simple>content</simple> <complex></complex>",
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
      filePath: "root_template.ts",
      lineNumber: 24
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
          args: [{ declarations: [SimpleComponent, ComplexComponent, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SimpleComponent, ComplexComponent, MyApp] });
})();
