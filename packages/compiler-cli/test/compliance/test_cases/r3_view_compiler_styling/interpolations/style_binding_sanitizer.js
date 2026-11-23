import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  myUrl1 = "...";
  myUrl2 = "...";
  myBoxX = "0px";
  myBoxY = "0px";
  myBoxWidth = "100px";
  myRepeat = "no-repeat";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 12,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
      }
      if (rf & 2) {
        i0.ɵɵstyleProp("background", i0.ɵɵinterpolate1("url(", ctx.myUrl1, ")"))(
          "border-image",
          i0.ɵɵinterpolate2("url(", ctx.myUrl2, ") ", ctx.myRepeat, " auto")
        )(
          "box-shadow",
          i0.ɵɵinterpolate3("", ctx.myBoxX, " ", ctx.myBoxY, " ", ctx.myBoxWidth, " black")
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
    <div style.background="url({{ myUrl1 }})"
         style.borderImage="url({{ myUrl2 }}) {{ myRepeat }} auto"
         style.boxShadow="{{ myBoxX }} {{ myBoxY }} {{ myBoxWidth }} black"></div>
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
      filePath: "style_binding_sanitizer.ts",
      lineNumber: 11
    });
})();
