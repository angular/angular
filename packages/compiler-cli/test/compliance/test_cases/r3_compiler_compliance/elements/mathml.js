import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MathCmp {
  static ɵfac = function MathCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MathCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MathCmp,
    selectors: [["math"]],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MathCmp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MathCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "math",
              template: "",
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
    i0.ɵsetClassDebugInfo(MathCmp, { className: "MathCmp", filePath: "mathml.ts", lineNumber: 7 });
})();
export class InfinityCmp {
  static ɵfac = function InfinityCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || InfinityCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: InfinityCmp,
    selectors: [["infinity"]],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function InfinityCmp_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      InfinityCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "infinity",
              template: "",
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
    i0.ɵsetClassDebugInfo(InfinityCmp, {
      className: "InfinityCmp",
      filePath: "mathml.ts",
      lineNumber: 14
    });
})();
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
    consts: [["title", "Hello", 1, "my-app"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵnamespaceMathML();
        i0.ɵɵelementStart(1, "math");
        i0.ɵɵelement(2, "infinity");
        i0.ɵɵelementEnd();
        i0.ɵɵnamespaceHTML();
        i0.ɵɵelementStart(3, "p");
        i0.ɵɵtext(4, "test");
        i0.ɵɵelementEnd()();
      }
    },
    dependencies: [MathCmp, InfinityCmp],
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
              template:
                '<div class="my-app" title="Hello"><math><infinity/></math><p>test</p></div>',
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
      filePath: "mathml.ts",
      lineNumber: 22
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
          args: [{ declarations: [MyComponent, MathCmp, InfinityCmp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, MathCmp, InfinityCmp] });
})();
