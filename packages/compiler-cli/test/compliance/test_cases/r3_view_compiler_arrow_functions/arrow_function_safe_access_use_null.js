import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => value => {
  let tmp_0_0;
  return value == null
    ? null
    : value.a == null
      ? null
      : value.a.b == null
        ? null
        : value.a.b.c == null
          ? null
          : (tmp_0_0 = value.a.b.c()) == null
            ? null
            : (tmp_0_0 = tmp_0_0()) == null
              ? null
              : (tmp_0_0 = tmp_0_0()) == null
                ? null
                : tmp_0_0();
};
const arrowFn1 = (ctx, view) => () => {
  let tmp_0_0;
  return ctx.componentProp == null
    ? null
    : ctx.componentProp.a == null
      ? null
      : ctx.componentProp.a.b == null
        ? null
        : ctx.componentProp.a.b.c == null
          ? null
          : (tmp_0_0 = ctx.componentProp.a.b.c()) == null
            ? null
            : (tmp_0_0 = tmp_0_0()) == null
              ? null
              : (tmp_0_0 = tmp_0_0()) == null
                ? null
                : tmp_0_0();
};
export class TestComp {
  componentProp = {};
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 4,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomElement(1, "hr");
        i0.ɵɵtext(2);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", i0.ɵɵarrowFunction(2, arrowFn0, ctx)(ctx.componentProp), " ");
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", i0.ɵɵarrowFunction(3, arrowFn1, ctx), " ");
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
    {{(value => value?.a?.b?.c?.()?.()?.()?.())(componentProp)}}
    <hr>
    {{() => componentProp?.a?.b?.c?.()?.()?.()?.()}}
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
      filePath: "arrow_function_safe_access_use_null.ts",
      lineNumber: 10
    });
})();
