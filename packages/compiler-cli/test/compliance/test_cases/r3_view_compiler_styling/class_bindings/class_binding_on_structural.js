import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElement(0, "div");
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("bar", ctx_r0.field);
  }
}
export class MyComponent {
  field;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 1,
    vars: 1,
    consts: [[3, "bar", 4, "ngIf"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyComponent_div_0_Template, 1, 2, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("ngIf", true);
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
              selector: "my-component",
              template: `
		<div *ngIf="true" [class.bar]="field"></div>
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
      filePath: "class_binding_on_structural.ts",
      lineNumber: 9
    });
})();
