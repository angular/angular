import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  constructor() {
    this.config = { get: () => undefined };
  }
}
MyApp.ɵfac = function MyApp_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyApp)();
};
MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["ng-component"]],
  standalone: false,
  decls: 5,
  vars: 5,
  consts: [[3, "title"]],
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelement(0, "span", 0)(1, "span", 0)(2, "span", 0)(3, "span", 0)(4, "span", 0);
    }
    if (rf & 2) {
      let tmp_2_0;
      let tmp_3_0;
      let tmp_4_0;
      i0.ɵɵproperty("title", ctx.person == null ? null : ctx.person.getName(false));
      i0.ɵɵadvance();
      i0.ɵɵproperty("title", (ctx.person == null ? null : ctx.person.getName(false)) || "");
      i0.ɵɵadvance();
      i0.ɵɵproperty(
        "title",
        ctx.person == null
          ? null
          : (tmp_2_0 = ctx.person.getName(false)) == null
            ? null
            : tmp_2_0.toLowerCase()
      );
      i0.ɵɵadvance();
      i0.ɵɵproperty(
        "title",
        ctx.person == null
          ? null
          : ctx.person.getName((tmp_3_0 = ctx.config.get("title")) == null ? null : tmp_3_0.enabled)
      );
      i0.ɵɵadvance();
      i0.ɵɵproperty(
        "title",
        ctx.person == null
          ? null
          : ctx.person.getName(
              ((tmp_4_0 = ctx.config.get("title")) == null ? null : tmp_4_0.enabled) ?? true
            )
      );
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
              template: `
    <span [title]="person?.getName(false)"></span>
    <span [title]="person?.getName(false) || ''"></span>
    <span [title]="person?.getName(false)?.toLowerCase()"></span>
    <span [title]="person?.getName(config.get('title')?.enabled)"></span>
    <span [title]="person?.getName(config.get('title')?.enabled ?? true)"></span>
`,
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "safe_method_call_use_null.ts",
      lineNumber: 13
    });
})();
