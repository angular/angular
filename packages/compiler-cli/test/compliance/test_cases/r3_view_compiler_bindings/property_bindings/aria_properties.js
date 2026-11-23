import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
class MyDir {
  static ɵfac = function MyDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: MyDir, selectors: [["", "myDir", ""]] });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyDir,
      [
        {
          type: Directive,
          args: [{ selector: "[myDir]" }]
        }
      ],
      null,
      null
    );
})();
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
    consts: [["myDir", "", 3, "aria-readonly", "ariaLabel"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "input", 0);
      }
      if (rf & 2) {
        i0.ɵɵariaProperty("aria-readonly", ctx.readonly);
        i0.ɵɵproperty("ariaLabel", ctx.label);
        i0.ɵɵattribute("aria-disabled", ctx.disabled);
      }
    },
    dependencies: [MyDir],
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
    <input myDir [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label">
  `,
              imports: [MyDir]
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
      filePath: "aria_properties.ts",
      lineNumber: 12
    });
})();
