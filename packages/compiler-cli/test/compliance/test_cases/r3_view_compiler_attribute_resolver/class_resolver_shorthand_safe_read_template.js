import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  choice = null;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 2,
    vars: 0,
    consts: [
      [3, "class"],
      [3, "attr.class"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div", 0);
        i0.ɵɵattributeResolver("class", function MyComponent_Template_div_class_0_listener($event) {
          return $event.resolve((ctx.choice == null ? null : ctx.choice.classes)($event.resolver));
        }, 3);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(1, "span", 1);
        i0.ɵɵattributeResolver("class", function MyComponent_Template_span_attr_class_1_listener($event) {
          return $event.resolve((ctx.choice == null ? null : ctx.choice.classes)($event.resolver));
        }, 1);
        i0.ɵɵdomElementEnd();
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
    <div (class)="choice?.classes"></div>
    <span (attr.class)="$event.resolve((choice?.classes)($event.resolver))"></span>
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
      filePath: "class_resolver_shorthand_safe_read.ts",
      lineNumber: 10
    });
})();
