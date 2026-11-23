import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function TestCmp_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1, "Hello!");
    i0.ɵɵelementEnd();
  }
}
const greeting = "Hello!";
const myTemplate = `<div *ngIf="show">${greeting}</div>`;
export class TestCmp {
  static ɵfac = function TestCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["test-cmp"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[4, "ngIf"]],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmp_div_0_Template, 2, 0, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.show);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "test-cmp",
              template: myTemplate,
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: "TestCmp",
      filePath: "non_literal_template_with_substitution.ts",
      lineNumber: 10
    });
})();
