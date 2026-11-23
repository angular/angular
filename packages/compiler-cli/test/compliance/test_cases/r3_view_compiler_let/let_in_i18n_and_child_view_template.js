import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 1);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const result_r1 = i0.ɵɵreadContextLet(2);
    i0.ɵɵi18nExp(result_r1);
    i0.ɵɵi18nApply(0);
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
        const MSG_EXTERNAL_4767697818648227077$$LET_IN_I18N_AND_CHILD_VIEW_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " The result is {$interpolation} {$startTagNgTemplate}To repeat, the result is {$interpolation}{$closeTagNgTemplate}",
            {
              "closeTagNgTemplate": "\uFFFD/*3:1\uFFFD",
              "interpolation": "[\uFFFD0\uFFFD|\uFFFD0:1\uFFFD]",
              "startTagNgTemplate": "\uFFFD*3:1\uFFFD"
            },
            {
              original_code: {
                "closeTagNgTemplate": "</ng-template>",
                "interpolation": "{{result}}",
                "startTagNgTemplate": "<ng-template>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_4767697818648227077$$LET_IN_I18N_AND_CHILD_VIEW_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` The result is ${"[\uFFFD0\uFFFD|\uFFFD0:1\uFFFD]"}:INTERPOLATION: ${"\uFFFD*3:1\uFFFD"}:START_TAG_NG_TEMPLATE:To repeat, the result is ${"[\uFFFD0\uFFFD|\uFFFD0:1\uFFFD]"}:INTERPOLATION:${"\uFFFD/*3:1\uFFFD"}:CLOSE_TAG_NG_TEMPLATE:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0];
    },
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdeclareLet(2);
        i0.ɵɵdomTemplate(3, MyApp_ng_template_3_Template, 1, 1, "ng-template");
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        const result_r2 = i0.ɵɵstoreLet(ctx.value * 2);
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(result_r2);
        i0.ɵɵi18nApply(1);
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
    <div i18n>
      @let result = value * 2;
      The result is {{result}}
      <ng-template>To repeat, the result is {{result}}</ng-template>
    </div>
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
      filePath: "let_in_i18n_and_child_view.ts",
      lineNumber: 12
    });
})();
