import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  wide = true;
  extra = "py-1";
  classes(cn) {
    return cn(this.extra);
  }
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 1,
    vars: 2,
    consts: [[1, "p-2", 3, "class"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div", 0);
        i0.ɵɵattributeResolver("class", function MyComponent_Template_div_class_0_listener($event) {
          return $event.resolve(ctx.classes($event.resolver));
        }, 3);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵclassProp("px-4", ctx.wide);
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
              template: `<div class="p-2" [class.px-4]="wide" (class)="classes"></div>`
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
      filePath: "class_resolver_element.ts",
      lineNumber: 7
    });
})();
