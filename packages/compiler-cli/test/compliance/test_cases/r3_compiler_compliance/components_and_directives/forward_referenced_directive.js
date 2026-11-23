import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class HostBindingComp {
  static ɵfac = function HostBindingComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostBindingComp,
    selectors: [["host-binding-comp"]],
    standalone: false,
    decls: 1,
    vars: 0,
    template: function HostBindingComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "my-forward-directive");
      }
    },
    dependencies: () => [MyForwardDirective],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "host-binding-comp",
              template: `
    <my-forward-directive></my-forward-directive>
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
    i0.ɵsetClassDebugInfo(HostBindingComp, {
      className: "HostBindingComp",
      filePath: "forward_referenced_directive.ts",
      lineNumber: 10
    });
})();
class MyForwardDirective {
  static ɵfac = function MyForwardDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyForwardDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyForwardDirective,
    selectors: [["my-forward-directive"]],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyForwardDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "my-forward-directive",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
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
          args: [{ declarations: [HostBindingComp, MyForwardDirective] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp, MyForwardDirective] });
})();
