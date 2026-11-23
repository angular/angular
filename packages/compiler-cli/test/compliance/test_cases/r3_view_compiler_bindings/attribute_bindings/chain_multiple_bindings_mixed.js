import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 5,
    consts: [[3, "id"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "button", 0);
      }
      if (rf & 2) {
        i0.ɵɵattribute("aria-label", i0.ɵɵinterpolate1("prefix-", 1 + 3));
        i0.ɵɵproperty("id", 2);
        i0.ɵɵattribute("title", 1)("tabindex", 3);
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
    <button [attr.title]="1" [id]="2" [attr.tabindex]="3" attr.aria-label="prefix-{{1 + 3}}">
    </button>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "chain_multiple_bindings_mixed.ts",
      lineNumber: 10
    });
})();
