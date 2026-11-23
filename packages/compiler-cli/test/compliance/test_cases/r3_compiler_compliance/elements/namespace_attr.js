import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  value;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 2,
    vars: 1,
    consts: [["id", "foo", 0, "xlink", "href", "/foo", "name", "foo"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵnamespaceSVG();
        i0.ɵɵdomElement(0, "use")(1, "use", 0);
      }
      if (rf & 2) {
        i0.ɵɵattribute("href", ctx.value, null, "xlink");
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
    <svg:use [attr.xlink:href]="value"/>
    <svg:use id="foo" xlink:href="/foo" name="foo"/>
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
      filePath: "namespace_attr.ts",
      lineNumber: 10
    });
})();
