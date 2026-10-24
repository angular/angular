import { Component, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => (a, b) => a + b;
const arrowFn1 = (ctx, view) => (a, b) => a + b + ctx.componentProp;
export class TestPipe {
  transform(value) {
    return value;
  }
  static ɵfac = function TestPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "test", type: TestPipe, pure: true });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestPipe,
      [
        {
          type: Pipe,
          args: [{ name: "test" }]
        }
      ],
      null,
      null
    );
})();
export class TestComp {
  componentProp = 0;
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 5,
    vars: 8,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵpipe(1, "test");
        i0.ɵɵdomElement(2, "hr");
        i0.ɵɵtext(3);
        i0.ɵɵpipe(4, "test");
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 3, i0.ɵɵarrowFunction(2, arrowFn0, ctx)), " ");
        i0.ɵɵadvance(3);
        i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 6, i0.ɵɵarrowFunction(5, arrowFn1, ctx)), " ");
      }
    },
    dependencies: [TestPipe],
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
              template: `
    {{(a, b) => a + b | test}}
    <hr>
    {{(a, b) => a + b + componentProp | test}}
  `,
              imports: [TestPipe]
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
      filePath: "arrow_function_pipe.ts",
      lineNumber: 18
    });
})();
