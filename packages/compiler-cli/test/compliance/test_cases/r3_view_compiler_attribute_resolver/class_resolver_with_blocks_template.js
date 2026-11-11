import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 0);
    i0.ɵɵattributeResolver("class", function MyComponent_Conditional_0_Template_div_class_0_listener($event) {
      i0.ɵɵrestoreView(_r1);
      const ctx_r1 = i0.ɵɵnextContext();
      return i0.ɵɵresetView($event.resolve(ctx_r1.classes($event.resolver)));
    }, 3);
    i0.ɵɵdomElementEnd();
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
    decls: 1,
    vars: 1,
    consts: [[3, "class"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyComponent_Conditional_0_Template, 1, 0, "div");
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
              template: `@if (show) { <div (class)="classes"></div> }`
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
      filePath: "class_resolver_with_blocks.ts",
      lineNumber: 7
    });
})();
