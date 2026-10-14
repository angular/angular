import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = [[["special"]], "*"];
const _c1 = ["special", "*"];
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    ngContentSelectors: _c1,
    decls: 4,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1823079451302886188$$NESTED_NG_CONTENT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagNgContent}{$closeTagNgContent}{$startTagNgContent_1}{$closeTagNgContent}",
            {
              "closeTagNgContent": "[\uFFFD/#2\uFFFD|\uFFFD/#3\uFFFD]",
              "startTagNgContent": "\uFFFD#2\uFFFD",
              "startTagNgContent_1": "\uFFFD#3\uFFFD"
            },
            {
              original_code: {
                "closeTagNgContent": "</ng-content>",
                "startTagNgContent": '<ng-content select="special">',
                "startTagNgContent_1": "<ng-content>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_1823079451302886188$$NESTED_NG_CONTENT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD#2\uFFFD"}:START_TAG_NG_CONTENT:${"[\uFFFD/#2\uFFFD|\uFFFD/#3\uFFFD]"}:CLOSE_TAG_NG_CONTENT:${"\uFFFD#3\uFFFD"}:START_TAG_NG_CONTENT_1:${"[\uFFFD/#2\uFFFD|\uFFFD/#3\uFFFD]"}:CLOSE_TAG_NG_CONTENT:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵprojection(2);
        i0.ɵɵprojection(3, 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
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
              selector: "my-component",
              template: `
  <div i18n>
    <ng-content select="special"></ng-content>
    <ng-content></ng-content>
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
      filePath: "nested_ng-content.ts",
      lineNumber: 12
    });
})();
