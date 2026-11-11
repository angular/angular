import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElement(0, "span");
  }
}
export class MyComponent {
  show = true;
  classes(cn) {
    return cn();
  }
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵattributeResolver("class", function MyComponent_class_HostBindingHandler($event) {
          return $event.resolve(ctx.classes($event.resolver));
        }, 3);
      }
    },
    decls: 1,
    vars: 1,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyComponent_Conditional_0_Template, 1, 0, "span");
      }
      if (rf & 2) {
        i0.ɵɵconditional(ctx.show ? 0 : -1);
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
              template: `@if (show) { <span></span> }`,
              host: { "(class)": "classes" }
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
      filePath: "class_resolver_host_with_blocks.ts",
      lineNumber: 8
    });
})();
