import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const value_r1 = i0.ɵɵreadContextLet(0);
    i0.ɵɵtextInterpolate(value_r1);
  }
}
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 2,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵtext(1);
        i0.ɵɵdomTemplate(2, MyApp_ng_template_2_Template, 1, 1, "ng-template");
      }
      if (rf & 2) {
        const value_r2 = i0.ɵɵstoreLet(123);
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", value_r2, " ");
      }
    },
    encapsulation: 2
  });
}
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
    @let value = 123;
    {{value}}
    <ng-template>{{value}}</ng-template>
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
      filePath: "let_shared_with_child_view.ts",
      lineNumber: 10
    });
})();
