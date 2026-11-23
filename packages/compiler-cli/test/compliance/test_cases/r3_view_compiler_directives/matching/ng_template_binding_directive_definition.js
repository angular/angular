import { Component, Directive, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_template_0_Template(rf, ctx) {}
export class SomeDirective {
  someDirective;
  static ɵfac = function SomeDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SomeDirective,
    selectors: [["", "someDirective", ""]],
    inputs: { someDirective: "someDirective" },
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
              selector: "[someDirective]",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        someDirective: [
          {
            type: Input
          }
        ]
      }
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
    vars: 1,
    consts: [[3, "someDirective"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("someDirective", true);
      }
    },
    dependencies: [SomeDirective],
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
              template: '<ng-template [someDirective]="true"></ng-template>',
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
      filePath: "ng_template_binding_directive.ts",
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
          args: [{ declarations: [SomeDirective, MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, MyComponent] });
})();
