import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  value = 1;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 1,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5917233897031232074$$LET_IN_I18N_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " The result is {$interpolation} ",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{result}}" } }
          );
        i18n_0 = MSG_EXTERNAL_5917233897031232074$$LET_IN_I18N_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` The result is ${"\uFFFD0\uFFFD"}:INTERPOLATION: `;
      }
      return [i18n_0];
    },
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        const result_r1 = ctx.value * 2;
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(result_r1);
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
      filePath: "let_in_i18n.ts",
      lineNumber: 11
    });
})();
