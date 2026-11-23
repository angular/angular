import { Component, Directive, Input } from "@angular/core";
import * as i0 from "@angular/core";
function TestComp_ng_template_0_Template(rf, ctx) {}
class WithInput {
  dir = "";
  static ɵfac = function WithInput_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || WithInput)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: WithInput,
    selectors: [["", "dir", ""]],
    inputs: { dir: "dir" },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      WithInput,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[dir]",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        dir: [
          {
            type: Input
          }
        ]
      }
    );
})();
export class TestComp {
  message = "Hello";
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 2,
    consts: [[3, "dir"]],
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestComp_ng_template_0_Template, 0, 0, "ng-template", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("dir", i0.ɵɵinterpolate(ctx.message));
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-app",
              template: '<ng-template dir="{{ message }}"></ng-template>',
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
    i0.ɵsetClassDebugInfo(TestComp, {
      className: "TestComp",
      filePath: "ng_template_interpolated_prop.ts",
      lineNumber: 16
    });
})();
