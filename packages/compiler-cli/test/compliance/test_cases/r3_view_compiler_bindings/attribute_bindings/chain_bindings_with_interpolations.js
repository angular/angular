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
    vars: 7,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "button");
      }
      if (rf & 2) {
        i0.ɵɵattribute("tabindex", i0.ɵɵinterpolate1("prefix-", 0 + 3))(
          "aria-label",
          i0.ɵɵinterpolate2("hello-", 1 + 3, "-", 2 + 3)
        )("title", 1)("id", 2);
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
    <button
      [attr.title]="1"
      [attr.id]="2"
      attr.tabindex="prefix-{{0 + 3}}"
      attr.aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>`,
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
      filePath: "chain_bindings_with_interpolations.ts",
      lineNumber: 12
    });
})();
