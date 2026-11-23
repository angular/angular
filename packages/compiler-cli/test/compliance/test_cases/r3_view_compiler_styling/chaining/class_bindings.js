import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  yesToApple = true;
  yesToOrange = true;
  yesToTomato = false;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 6,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
      }
      if (rf & 2) {
        i0.ɵɵclassProp("apple", ctx.yesToApple)("orange", ctx.yesToOrange)(
          "tomato",
          ctx.yesToTomato
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
              template: `<div
   [class.apple]="yesToApple"
   [class.orange]="yesToOrange"
   [class.tomato]="yesToTomato"></div>`,
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
      filePath: "class_bindings.ts",
      lineNumber: 10
    });
})();
