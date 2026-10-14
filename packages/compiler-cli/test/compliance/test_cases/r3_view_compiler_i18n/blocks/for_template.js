import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "span");
    i0.ɵɵi18nEnd();
  }
}
function MyApp_ForEmpty_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
  }
}
export class MyApp {
  items = [1, 2, 3];
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 5,
    vars: 1,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7811380212725452224$$FOR_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " Content: {$startBlockFor} before{$startTagSpan}middle{$closeTagSpan}after {$closeBlockFor}{$startBlockEmpty} before{$startTagDiv}empty{$closeTagDiv}after {$closeBlockEmpty}! ",
            {
              "closeBlockEmpty": "\uFFFD/*4:2\uFFFD",
              "closeBlockFor": "\uFFFD/*3:1\uFFFD",
              "closeTagDiv": "\uFFFD/#1:2\uFFFD",
              "closeTagSpan": "\uFFFD/#1:1\uFFFD",
              "startBlockEmpty": "\uFFFD*4:2\uFFFD",
              "startBlockFor": "\uFFFD*3:1\uFFFD",
              "startTagDiv": "\uFFFD#1:2\uFFFD",
              "startTagSpan": "\uFFFD#1:1\uFFFD"
            },
            {
              original_code: {
                "closeBlockEmpty": "}",
                "closeBlockFor": "}",
                "closeTagDiv": "</div>",
                "closeTagSpan": "</span>",
                "startBlockEmpty": "@empty {",
                "startBlockFor": "@for (item of items; track item) {",
                "startTagDiv": "<div>",
                "startTagSpan": "<span>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_7811380212725452224$$FOR_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Content: ${"\uFFFD*3:1\uFFFD"}:START_BLOCK_FOR: before${"\uFFFD#1:1\uFFFD"}:START_TAG_SPAN:middle${"\uFFFD/#1:1\uFFFD"}:CLOSE_TAG_SPAN:after ${"\uFFFD/*3:1\uFFFD"}:CLOSE_BLOCK_FOR:${"\uFFFD*4:2\uFFFD"}:START_BLOCK_EMPTY: before${"\uFFFD#1:2\uFFFD"}:START_TAG_DIV:empty${"\uFFFD/#1:2\uFFFD"}:CLOSE_TAG_DIV:after ${"\uFFFD/*4:2\uFFFD"}:CLOSE_BLOCK_EMPTY:! `;
      }
      return [i18n_0];
    },
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵrepeaterCreate(
          2,
          MyApp_For_3_Template,
          2,
          0,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
          false,
          MyApp_ForEmpty_4_Template,
          2,
          0
        );
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵrepeater(ctx.items);
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
      Content:
      @for (item of items; track item) {
        before<span>middle</span>after
      } @empty {
        before<div>empty</div>after
      }!
    </div>
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
    i0.ɵsetClassDebugInfo(MyApp, { className: "MyApp", filePath: "for.ts", lineNumber: 16 });
})();
