import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  forValue = "some-input";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 1,
    consts: [[3, "for"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "label", 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("htmlFor", ctx.forValue);
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
              template: `<label [for]="forValue"></label>`
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
      filePath: "special_property_remapping_dom_property.ts",
      lineNumber: 6
    });
})();
