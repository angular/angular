import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  foo;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-comp"]],
    decls: 5,
    vars: 8,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6301050568345677976$$ATTRIBUTE_INTERPOLATION_TS_0 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT, select, other {{START_TAG_SPAN}foo{CLOSE_TAG_SPAN}}}");
        i18n_0 = MSG_EXTERNAL_6301050568345677976$$ATTRIBUTE_INTERPOLATION_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, other {{START_TAG_SPAN}foo{CLOSE_TAG_SPAN}}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        "CLOSE_TAG_SPAN": "</span>",
        "START_TAG_SPAN": '<span title="\uFFFD1\uFFFD-\uFFFD2\uFFFD">',
        "VAR_SELECT": "\uFFFD0\uFFFD"
      });
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_369205108016154659$$ATTRIBUTE_INTERPOLATION_TS_1 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT, select, other {{INTERPOLATION}-{INTERPOLATION}}}");
        i18n_1 = MSG_EXTERNAL_369205108016154659$$ATTRIBUTE_INTERPOLATION_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, other {{INTERPOLATION}-{INTERPOLATION}}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, {
        "INTERPOLATION": "\uFFFD4\uFFFD",
        "VAR_SELECT": "\uFFFD3\uFFFD"
      });
      let i18n_2;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6009429127580785009$$ATTRIBUTE_INTERPOLATION_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagSpan}{$closeTagSpan}{$startTagSpan_1}{$icu}{$closeTagSpan}{$startTagSpan_1}{$icu_1}{$closeTagSpan}",
            {
              "closeTagSpan": "[\uFFFD/#2\uFFFD|\uFFFD/#3\uFFFD|\uFFFD/#4\uFFFD]",
              "icu": i18n_0,
              "icu_1": i18n_1,
              "startTagSpan": "\uFFFD#2\uFFFD",
              "startTagSpan_1": "[\uFFFD#3\uFFFD|\uFFFD#4\uFFFD]"
            },
            {
              original_code: {
                "closeTagSpan": "</span>",
                "icu": '{foo, select, other {<span title="{{foo}}-{{foo}}">foo</span>}}',
                "icu_1": "{foo, select, other {{{foo}}-{{foo}}}}",
                "startTagSpan": '<span title="{{foo}}-{{foo}}">',
                "startTagSpan_1": "<span>"
              }
            }
          );
        i18n_2 = MSG_EXTERNAL_6009429127580785009$$ATTRIBUTE_INTERPOLATION_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`${"\uFFFD#2\uFFFD"}:START_TAG_SPAN:${"[\uFFFD/#2\uFFFD|\uFFFD/#3\uFFFD|\uFFFD/#4\uFFFD]"}:CLOSE_TAG_SPAN:${"[\uFFFD#3\uFFFD|\uFFFD#4\uFFFD]"}:START_TAG_SPAN_1:${i18n_0}:ICU@@6051755734147382484:${"[\uFFFD/#2\uFFFD|\uFFFD/#3\uFFFD|\uFFFD/#4\uFFFD]"}:CLOSE_TAG_SPAN:${"[\uFFFD#3\uFFFD|\uFFFD#4\uFFFD]"}:START_TAG_SPAN_1:${i18n_1}:ICU_1@@7593934392904803263:${"[\uFFFD/#2\uFFFD|\uFFFD/#3\uFFFD|\uFFFD/#4\uFFFD]"}:CLOSE_TAG_SPAN:`;
      }
      i18n_2 = i0.ɵɵi18nPostprocess(i18n_2);
      return [i18n_2, [3, "title"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomElement(2, "span", 1)(3, "span")(4, "span");
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵdomProperty("title", i0.ɵɵinterpolate2("", ctx.foo, "-", ctx.foo));
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.foo)(ctx.foo)(ctx.foo)(ctx.foo)(ctx.foo);
        i0.ɵɵi18nApply(1);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-comp",
              template: `
  <div i18n>
    <span title="{{foo}}-{{foo}}"></span>
    <span>{foo, select, other {<span title="{{foo}}-{{foo}}">foo</span>}}</span>
    <span>{foo, select, other {{{foo}}-{{foo}}}}</span>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "attribute_interpolation.ts",
      lineNumber: 13
    });
})();
