import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_template_0_Template(rf, ctx) {}
function MyComponent_ng_template_1_Template(rf, ctx) {}
export class MyComponent {
  resolve = cn => cn();
  capture(event) {}
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
        i0.ɵɵdomTemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
        i0.ɵɵattributeResolver("class", function MyComponent_Template_ng_template_class_0_listener($event) {
          return $event.resolve(ctx.resolve($event.resolver));
        }, 3);
        i0.ɵɵdomTemplate(1, MyComponent_ng_template_1_Template, 0, 0, "ng-template", 1);
        i0.ɵɵattributeResolver("class", function MyComponent_Template_ng_template_attr_class_1_listener($event) {
          return ctx.capture($event);
        }, 1);
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
    <ng-template (class)="resolve"></ng-template>
    <ng-template (attr.class)="capture($event)"></ng-template>
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
      filePath: "class_resolver_ng_template.ts",
      lineNumber: 10
    });
})();
