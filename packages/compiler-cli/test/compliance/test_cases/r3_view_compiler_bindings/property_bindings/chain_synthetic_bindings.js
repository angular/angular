import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  expansionState = "expanded";
  myTitle = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 4,
    consts: [[3, "title", "tabindex"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "button", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("title", ctx.myTitle)("@expand", ctx.expansionState)("tabindex", 1)(
          "@fade",
          "out"
        );
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
      [title]="myTitle"
      [@expand]="expansionState"
      [tabindex]="1"
      [@fade]="'out'"></button>
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
      filePath: "chain_synthetic_bindings.ts",
      lineNumber: 13
    });
})();
