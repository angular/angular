import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = () => [3];
const _c1 = a0 => [2, ...a0];
export class TestComp {
  foo = [];
  bar = [];
  baz = [];
  fn(..._) {}
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 7,
    vars: 7,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomElement(1, "hr");
        i0.ɵɵtext(2);
        i0.ɵɵdomElement(3, "hr");
        i0.ɵɵtext(4);
        i0.ɵɵdomElement(5, "hr");
        i0.ɵɵtext(6);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", ctx.fn(...ctx.foo), " ");
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", ctx.fn(1, ...ctx.foo, 2), " ");
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", ctx.fn(...ctx.foo, 1, ...ctx.bar, ...ctx.baz, 2), " ");
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          " ",
          ctx.fn(1, ...i0.ɵɵpureFunction1(5, _c1, i0.ɵɵpureFunction0(4, _c0))),
          " "
        );
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
              template: `
    {{fn(...foo)}}
    <hr>
    {{fn(1, ...foo, 2)}}
    <hr>
    {{fn(...foo, 1, ...bar, ...baz, 2)}}
    <hr>
    {{fn(1, ...[2, ...[3]])}}
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
    i0.ɵsetClassDebugInfo(TestComp, {
      className: "TestComp",
      filePath: "call_rest.ts",
      lineNumber: 14
    });
})();
