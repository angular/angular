import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class ChildComponent {
  static ɵfac = function ChildComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ChildComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ChildComponent,
    selectors: [["child"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function ChildComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "child-view");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ChildComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "child",
              template: "child-view",
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
    i0.ɵsetClassDebugInfo(ChildComponent, {
      className: "ChildComponent",
      filePath: "directives.ts",
      lineNumber: 7
    });
})();
export class SomeDirective {
  static ɵfac = function SomeDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SomeDirective,
    selectors: [["", "some-directive", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[some-directive]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 0,
    consts: [["some-directive", ""]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "child", 0);
        i0.ɵɵtext(1, "!");
      }
    },
    dependencies: [ChildComponent, SomeDirective],
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
              template: "<child some-directive></child>!",
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
      filePath: "directives.ts",
      lineNumber: 21
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
          args: [{ declarations: [ChildComponent, SomeDirective, MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ChildComponent, SomeDirective, MyComponent] });
})();
