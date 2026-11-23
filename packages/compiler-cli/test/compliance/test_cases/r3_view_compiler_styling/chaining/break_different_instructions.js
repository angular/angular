import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  one = "";
  transition = "all 1337ms ease";
  width = "42px";
  yesToApple = true;
  yesToOrange = true;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 20,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
      }
      if (rf & 2) {
        i0.ɵɵstyleProp("color", i0.ɵɵinterpolate1("a", ctx.one, "b"))(
          "border",
          i0.ɵɵinterpolate1("a", ctx.one, "b")
        )("transition", ctx.transition)("width", ctx.width)(
          "height",
          i0.ɵɵinterpolate1("a", ctx.one, "b")
        )("top", i0.ɵɵinterpolate1("a", ctx.one, "b"));
        i0.ɵɵclassProp("apple", ctx.yesToApple)("orange", ctx.yesToOrange);
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
                    style.color="a{{one}}b"
                    style.border="a{{one}}b"
                    [class.apple]="yesToApple"
                    [style.transition]="transition"
                    [class.orange]="yesToOrange"
                    [style.width]="width"
                    style.height="a{{one}}b"
                    style.top="a{{one}}b"></div>`,
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
      filePath: "break_different_instructions.ts",
      lineNumber: 15
    });
})();
