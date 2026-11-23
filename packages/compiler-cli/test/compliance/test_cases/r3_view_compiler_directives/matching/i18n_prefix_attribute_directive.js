import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class I18nDirective {
  static ɵfac = function I18nDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || I18nDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: I18nDirective,
    selectors: [["", "i18n", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      I18nDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[i18n]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class I18nFooDirective {
  static ɵfac = function I18nFooDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || I18nFooDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: I18nFooDirective,
    selectors: [["", "i18n-foo", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      I18nFooDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[i18n-foo]",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class FooDirective {
  static ɵfac = function FooDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FooDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: FooDirective,
    selectors: [["", "foo", ""]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      FooDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[foo]",
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
    decls: 1,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
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
              template: "<div i18n-foo></div>",
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
      filePath: "i18n_prefix_attribute_directive.ts",
      lineNumber: 28
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
          args: [{ declarations: [I18nDirective, I18nFooDirective, FooDirective, MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [I18nDirective, I18nFooDirective, FooDirective, MyComponent]
    });
})();
