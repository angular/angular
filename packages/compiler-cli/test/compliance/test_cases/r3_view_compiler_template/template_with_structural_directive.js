import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_0_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, "Content");
  }
}
function MyComponent_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomTemplate(0, MyComponent_0_ng_template_0_Template, 1, 0, "ng-template");
  }
}
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 1,
    vars: 1,
    consts: [[4, "ngIf"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyComponent_0_Template, 1, 0, null, 0);
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
  <ng-template *ngIf="true">Content</ng-template>
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
      filePath: "template_with_structural_directive.ts",
      lineNumber: 9
    });
})();
