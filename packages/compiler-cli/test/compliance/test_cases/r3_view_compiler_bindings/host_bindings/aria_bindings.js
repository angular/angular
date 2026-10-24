import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  disabled = "";
  readonly = "";
  label = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    hostVars: 3,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵdomProperty("ariaLabel", ctx.label);
        i0.ɵɵattribute("aria-disabled", ctx.disabled)("aria-readonly", ctx.readonly);
      }
    },
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
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
              template: ``,
              host: {
                "[attr.aria-disabled]": "disabled",
                "[aria-readonly]": "readonly",
                "[ariaLabel]": "label"
              }
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
      filePath: "aria_bindings.ts",
      lineNumber: 11
    });
})();
