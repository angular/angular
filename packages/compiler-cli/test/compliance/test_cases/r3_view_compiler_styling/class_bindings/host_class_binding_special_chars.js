import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  expr = true;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    hostVars: 6,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵclassProp("text-primary/80", ctx.expr)("data-active:text-green-300/80", ctx.expr)(
          "data-[size='large']:p-8",
          ctx.expr
        );
      }
    },
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
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
              template: ``,
              host: {
                "[class.text-primary/80]": "expr",
                "[class.data-active:text-green-300/80]": "expr",
                "[class.data-[size='large']:p-8]": "expr"
              }
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
      filePath: "host_class_binding_special_chars.ts",
      lineNumber: 11
    });
})();
