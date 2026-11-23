import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  one = "";
  two = "";
  three = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 24,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
      }
      if (rf & 2) {
        i0.ɵɵstyleProp("color", i0.ɵɵinterpolate1("a", ctx.one, "b"))(
          "border",
          i0.ɵɵinterpolate1("a", ctx.one, "b")
        )("transition", i0.ɵɵinterpolate2("a", ctx.one, "b", ctx.two, "c"))(
          "width",
          i0.ɵɵinterpolate2("a", ctx.one, "b", ctx.two, "c")
        )("height", i0.ɵɵinterpolate3("a", ctx.one, "b", ctx.two, "c", ctx.three, "d"))(
          "top",
          i0.ɵɵinterpolate3("a", ctx.one, "b", ctx.two, "c", ctx.three, "d")
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
    style.color="a{{one}}b"
    style.border="a{{one}}b"
    style.transition="a{{one}}b{{two}}c"
    style.width="a{{one}}b{{two}}c"
    style.height="a{{one}}b{{two}}c{{three}}d"
    style.top="a{{one}}b{{two}}c{{three}}d"></div>`,
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
      filePath: "interpolations_different_arity.ts",
      lineNumber: 13
    });
})();
