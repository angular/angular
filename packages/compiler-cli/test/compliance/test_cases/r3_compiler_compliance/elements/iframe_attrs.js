import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  fullscreen = "false";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 1,
    vars: 2,
    consts: [["allow", "camera 'none'"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "iframe", 0);
      }
      if (rf & 2) {
        i0.ɵɵattribute("fetchpriority", "low", i0.ɵɵvalidateAttribute)(
          "allowfullscreen",
          ctx.fullscreen,
          i0.ɵɵvalidateAttribute
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
              selector: "my-component",
              template: `
  <iframe allow="camera 'none'" [attr.fetchpriority]="'low'" [attr.allowfullscreen]="fullscreen"></iframe>
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
      filePath: "iframe_attrs.ts",
      lineNumber: 10
    });
})();
