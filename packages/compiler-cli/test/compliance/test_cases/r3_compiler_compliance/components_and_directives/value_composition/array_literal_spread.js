import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => [...a0];
const _c1 = a0 => [1, ...a0, 2];
const _c2 = (a0, a1, a2) => [...a0, 1, ...a1, ...a2, 2];
const _c3 = () => [3];
const _c4 = a0 => [2, ...a0];
const _c5 = a0 => [1, ...a0];
export class ArrayComp {
  foo = [];
  bar = [];
  baz = [];
  static ɵfac = function ArrayComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ArrayComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ArrayComp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 17,
    template: function ArrayComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        const simple_r1 = i0.ɵɵpureFunction1(4, _c0, ctx.foo);
        const otherEntries_r2 = i0.ɵɵpureFunction1(6, _c1, ctx.foo);
        const multipleSpreads_r3 = i0.ɵɵpureFunction3(8, _c2, ctx.foo, ctx.bar, ctx.baz);
        const inlineArraySpread_r4 = i0.ɵɵpureFunction1(
          15,
          _c5,
          i0.ɵɵpureFunction1(13, _c4, i0.ɵɵpureFunction0(12, _c3))
        );
        i0.ɵɵtextInterpolate4(
          " ",
          simple_r1,
          " ",
          otherEntries_r2,
          " ",
          multipleSpreads_r3,
          " ",
          inlineArraySpread_r4,
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
      ArrayComp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @let simple = [...foo];
    @let otherEntries = [1, ...foo, 2];
    @let multipleSpreads = [...foo, 1, ...bar, ...baz, 2];
    @let inlineArraySpread = [1, ...[2, ...[3]]];

    <!-- Use the arrays so they don't get flagged as unused. -->
    {{simple}} {{otherEntries}} {{multipleSpreads}} {{inlineArraySpread}}
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
    i0.ɵsetClassDebugInfo(ArrayComp, {
      className: "ArrayComp",
      filePath: "array_literal_spread.ts",
      lineNumber: 14
    });
})();
