import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵdomElement(0, "svg", 0);
  }
}
function MyApp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵnamespaceMathML();
    i0.ɵɵdomElement(0, "math", 1);
  }
}
export class MyApp {
  expr = true;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 1,
    consts: [
      ["foo", "1"],
      ["foo", "2"]
    ],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 1, 0, "svg", 0)(
          1,
          MyApp_Conditional_1_Template,
          1,
          0,
          "math",
          1
        );
      }
      if (rf & 2) {
        i0.ɵɵconditional(ctx.expr ? 0 : 1);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @if (expr) {
      <svg foo="1"></svg>
    } @else {
      <math foo="2"></math>
    }
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "if_namespaced_root_node.ts",
      lineNumber: 12
    });
})();
