import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => ["red", a0];
export class HostBindingComp {
  id = "some id";
  static ɵfac = function HostBindingComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostBindingComp,
    selectors: [["host-binding-comp"]],
    hostVars: 3,
    hostBindings: function HostBindingComp_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵdomProperty("id", i0.ɵɵpureFunction1(1, _c0, ctx.id));
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function HostBindingComp_Template(rf, ctx) {},
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
              host: { "[id]": '["red", id]' },
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
    i0.ɵsetClassDebugInfo(HostBindingComp, {
      className: "HostBindingComp",
      filePath: "host_bindings_with_pure_functions.ts",
      lineNumber: 7
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
          args: [{ declarations: [HostBindingComp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp] });
})();
