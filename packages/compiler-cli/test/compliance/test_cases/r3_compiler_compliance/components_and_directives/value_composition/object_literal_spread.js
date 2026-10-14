import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => ({ ...a0 });
const _c1 = a0 => ({ a: 1, ...a0, b: 2 });
const _c2 = (a0, a1, a2) => ({ ...a0, a: 1, ...a1, ...a2, b: 2 });
const _c3 = () => ({ c: 3 });
const _c4 = a0 => ({ b: a0 });
const _c5 = a0 => ({ a: 1, ...a0 });
export class ObjectComp {
  foo = {};
  bar = {};
  baz = {};
  static ɵfac = function ObjectComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ObjectComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ObjectComp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 19,
    template: function ObjectComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        const simple_r1 = i0.ɵɵpureFunction1(4, _c0, ctx.foo);
        const otherProps_r2 = i0.ɵɵpureFunction1(6, _c1, ctx.foo);
        const multipleSpreads_r3 = i0.ɵɵpureFunction3(8, _c2, ctx.foo, ctx.bar, ctx.baz);
        const objectLiteral_r4 = i0.ɵɵpureFunction1(
          17,
          _c5,
          i0.ɵɵpureFunction1(15, _c4, i0.ɵɵpureFunction1(13, _c0, i0.ɵɵpureFunction0(12, _c3)))
        );
        i0.ɵɵtextInterpolate4(
          " ",
          simple_r1,
          " ",
          otherProps_r2,
          " ",
          multipleSpreads_r3,
          " ",
          objectLiteral_r4,
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
      ObjectComp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @let simple = {...foo};
    @let otherProps = {a: 1, ...foo, b: 2};
    @let multipleSpreads = {...foo, a: 1, ...bar, ...baz, b: 2};
    @let objectLiteral = {a: 1, ...{b: {...{c: 3}}}};

    <!-- Use the objects so they don't get flagged as unused. -->
    {{simple}} {{otherProps}} {{multipleSpreads}} {{objectLiteral}}
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
    i0.ɵsetClassDebugInfo(ObjectComp, {
      className: "ObjectComp",
      filePath: "object_literal_spread.ts",
      lineNumber: 14
    });
})();
