import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  size = "width: 1px";
  resolve(event) {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 2,
    vars: 0,
    consts: [
      [3, "style"],
      [3, "attr.style"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div", 0);
        i0.ɵɵattributeResolver(
          "style",
          function MyComponent_Template_div_style_0_listener($event) {
            return $event.resolve((s => s(ctx.size))($event.resolver));
          },
          3
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(1, "span", 1);
        i0.ɵɵattributeResolver(
          "style",
          function MyComponent_Template_span_attr_style_1_listener($event) {
            return ctx.resolve($event);
          },
          1
        );
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
              template: `<div (style)="(s) => s(size)"></div><span (attr.style)="resolve($event)"></span>`
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
      filePath: "style_resolver_element.ts",
      lineNumber: 7
    });
})();
