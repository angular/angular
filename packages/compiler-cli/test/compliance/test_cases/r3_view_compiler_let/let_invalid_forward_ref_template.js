import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", undefined, " ");
    ctx_r0.value * 2;
  }
}
export class MyApp {
  value = 1;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_ng_template_0_Template, 1, 1, "ng-template");
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
    <ng-template>
      {{result}}
      @let result = value * 2;
    </ng-template>
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
      filePath: "let_invalid_forward_ref.ts",
      lineNumber: 11
    });
})();
