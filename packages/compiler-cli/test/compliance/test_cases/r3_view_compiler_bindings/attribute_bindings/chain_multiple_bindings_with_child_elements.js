import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  myTitle = "hello";
  buttonId = "special-button";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 2,
    vars: 6,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "button");
        i0.ɵɵelement(1, "span");
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵattribute("title", ctx.myTitle)("id", ctx.buttonId)("tabindex", 1);
        i0.ɵɵadvance();
        i0.ɵɵattribute("id", 1)("title", "hello")("some-attr", 1 + 2);
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
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1">
      <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    </button>`,
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
      filePath: "chain_multiple_bindings_with_child_elements.ts",
      lineNumber: 10
    });
})();
