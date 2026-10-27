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
    decls: 1,
    vars: 3,
    consts: [[3, "ariaLabel"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "input", 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("ariaLabel", ctx.label);
        i0.ɵɵattribute("aria-disabled", ctx.disabled)("aria-readonly", ctx.readonly);
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
              template: `
    <input [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label">
  `
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
      filePath: "aria_dom_properties.ts",
      lineNumber: 8
    });
})();
