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
      i0.ɵɵproperty("title", ctx.person?.getName(false));
      i0.ɵɵadvance();
      i0.ɵɵproperty("title", ctx.person?.getName(false) || "");
      i0.ɵɵadvance();
      i0.ɵɵproperty("title", ctx.person?.getName(false)?.toLowerCase());
      i0.ɵɵadvance();
      i0.ɵɵproperty("title", ctx.person?.getName(ctx.config.get("title")?.enabled));
      i0.ɵɵadvance();
      i0.ɵɵproperty("title", ctx.person?.getName(ctx.config.get("title")?.enabled ?? true));
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
      filePath: "safe_method_call.ts",
      lineNumber: 13
    });
})();
