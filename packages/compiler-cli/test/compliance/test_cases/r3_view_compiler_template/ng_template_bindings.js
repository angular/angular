import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_template_0_Template(rf, ctx) {}
export class MyComponent {
  p1;
  a1;
  c1;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 1,
    vars: 3,
    consts: [["l", "l1", 3, "p", "a", "c"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("p", ctx.p1)("a", ctx.a1)("c", ctx.c1);
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
              template: '<ng-template l="l1" [p]="p1" [attr.a]="a1" [class.c]="c1"></ng-template>'
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
      filePath: "ng_template_bindings.ts",
      lineNumber: 7
    });
})();
