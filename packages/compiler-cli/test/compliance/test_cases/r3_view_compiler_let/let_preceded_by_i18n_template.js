import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const result_r1 = i0.ɵɵreadContextLet(2);
    i0.ɵɵtextInterpolate1("The result is ", result_r1);
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
    decls: 4,
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4986895904639400025$$LET_PRECEDED_BY_I18N_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "Hello {$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{value}}" } }
          );
        i18n_0 = MSG_EXTERNAL_4986895904639400025$$LET_PRECEDED_BY_I18N_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      return [i18n_0];
    },
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdeclareLet(2);
        i0.ɵɵdomTemplate(3, MyApp_ng_template_3_Template, 1, 1, "ng-template");
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance();
        i0.ɵɵstoreLet(ctx.value * 2);
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
    <div i18n>Hello {{value}}</div>
    @let result = value * 2;
    <ng-template>The result is {{result}}</ng-template>
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
      filePath: "let_preceded_by_i18n.ts",
      lineNumber: 10
    });
})();
