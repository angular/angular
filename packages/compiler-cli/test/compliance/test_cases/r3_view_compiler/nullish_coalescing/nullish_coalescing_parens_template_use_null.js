import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  constructor() {
    this.x = null;
    this.y = 0;
    this.z = 1;
  }
}
MyApp.ɵfac = function MyApp_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyApp)();
};
MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["my-app"]],
  decls: 14,
  vars: 7,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵdomElementStart(0, "div");
      i0.ɵɵtext(1);
      i0.ɵɵdomElementEnd();
      i0.ɵɵdomElementStart(2, "div");
      i0.ɵɵtext(3);
      i0.ɵɵdomElementEnd();
      i0.ɵɵdomElementStart(4, "div");
      i0.ɵɵtext(5);
      i0.ɵɵdomElementEnd();
      i0.ɵɵdomElementStart(6, "div");
      i0.ɵɵtext(7);
      i0.ɵɵdomElementEnd();
      i0.ɵɵdomElementStart(8, "div");
      i0.ɵɵtext(9);
      i0.ɵɵdomElementEnd();
      i0.ɵɵdomElementStart(10, "div");
      i0.ɵɵtext(11);
      i0.ɵɵdomElementEnd();
      i0.ɵɵdomElementStart(12, "div");
      i0.ɵɵtext(13);
      i0.ɵɵdomElementEnd();
    }
    if (rf & 2) {
      i0.ɵɵadvance();
      i0.ɵɵtextInterpolate((ctx.x && ctx.y) ?? ctx.z);
      i0.ɵɵadvance(2);
      i0.ɵɵtextInterpolate(ctx.x && (ctx.y ?? ctx.z));
      i0.ɵɵadvance(2);
      i0.ɵɵtextInterpolate((ctx.x == null ? null : ctx.x.y) ?? (ctx.y == null ? null : ctx.y.z));
      i0.ɵɵadvance(2);
      i0.ɵɵtextInterpolate(((ctx.x == null ? null : ctx.x.y) ?? ctx.y) || ctx.z);
      i0.ɵɵadvance(2);
      i0.ɵɵtextInterpolate(((ctx.x == null ? null : ctx.x.y) ?? ctx.y) && ctx.z);
      i0.ɵɵadvance(2);
      i0.ɵɵtextInterpolate(ctx.z || ((ctx.x == null ? null : ctx.x.y) ?? ctx.y));
      i0.ɵɵadvance(2);
      i0.ɵɵtextInterpolate(ctx.z && ((ctx.x == null ? null : ctx.x.y) ?? ctx.y));
    }
  },
  encapsulation: 2
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-app",
              template: `
    <div>{{ (x && y) ?? z }}</div>
    <div>{{ x && (y ?? z) }}</div>
    <div>{{ x?.y ?? y?.z }}</div>
    <div>{{ (x?.y ?? y) || z }}</div>
    <div>{{ (x?.y ?? y) && z }}</div>
    <div>{{ z || (x?.y ?? y) }}</div>
    <div>{{ z && (x?.y ?? y) }}</div>
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
      filePath: "nullish_coalescing_parens_use_null.ts",
      lineNumber: 15
    });
})();
