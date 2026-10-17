import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Defer_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "span");
    i0.ɵɵi18nEnd();
  }
}
function MyApp_DeferLoading_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, "button");
    i0.ɵɵi18nEnd();
  }
}
function MyApp_DeferPlaceholder_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
  }
}
function MyApp_DeferError_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 4);
    i0.ɵɵelement(1, "h1");
    i0.ɵɵi18nEnd();
  }
}
export class MyApp {
  isLoaded = false;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 8,
    vars: 1,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7863738818382242773$$DEFER_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " Content: {$startBlockDefer} before{$startTagSpan}middle{$closeTagSpan}after {$closeBlockDefer}{$startBlockPlaceholder} before{$startTagDiv}placeholder{$closeTagDiv}after {$closeBlockPlaceholder}{$startBlockLoading} before{$startTagButton}loading{$closeTagButton}after {$closeBlockLoading}{$startBlockError} before{$startHeadingLevel1}error{$closeHeadingLevel1}after {$closeBlockError}",
            {
              "closeBlockDefer": "\uFFFD/*2:1\uFFFD",
              "closeBlockError": "\uFFFD/*5:4\uFFFD",
              "closeBlockLoading": "\uFFFD/*3:2\uFFFD",
              "closeBlockPlaceholder": "\uFFFD/*4:3\uFFFD",
              "closeHeadingLevel1": "\uFFFD/#1:4\uFFFD",
              "closeTagButton": "\uFFFD/#1:2\uFFFD",
              "closeTagDiv": "\uFFFD/#1:3\uFFFD",
              "closeTagSpan": "\uFFFD/#1:1\uFFFD",
              "startBlockDefer": "\uFFFD*2:1\uFFFD",
              "startBlockError": "\uFFFD*5:4\uFFFD",
              "startBlockLoading": "\uFFFD*3:2\uFFFD",
              "startBlockPlaceholder": "\uFFFD*4:3\uFFFD",
              "startHeadingLevel1": "\uFFFD#1:4\uFFFD",
              "startTagButton": "\uFFFD#1:2\uFFFD",
              "startTagDiv": "\uFFFD#1:3\uFFFD",
              "startTagSpan": "\uFFFD#1:1\uFFFD"
            },
            {
              original_code: {
                "closeBlockDefer": "}",
                "closeBlockError": "}",
                "closeBlockLoading": "}",
                "closeBlockPlaceholder": "}",
                "closeHeadingLevel1": "</h1>",
                "closeTagButton": "</button>",
                "closeTagDiv": "</div>",
                "closeTagSpan": "</span>",
                "startBlockDefer": "@defer (when isLoaded) {",
                "startBlockError": "@error {",
                "startBlockLoading": "@loading {",
                "startBlockPlaceholder": "@placeholder {",
                "startHeadingLevel1": "<h1>",
                "startTagButton": "<button>",
                "startTagDiv": "<div>",
                "startTagSpan": "<span>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_7863738818382242773$$DEFER_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Content: ${"\uFFFD*2:1\uFFFD"}:START_BLOCK_DEFER: before${"\uFFFD#1:1\uFFFD"}:START_TAG_SPAN:middle${"\uFFFD/#1:1\uFFFD"}:CLOSE_TAG_SPAN:after ${"\uFFFD/*2:1\uFFFD"}:CLOSE_BLOCK_DEFER:${"\uFFFD*4:3\uFFFD"}:START_BLOCK_PLACEHOLDER: before${"\uFFFD#1:3\uFFFD"}:START_TAG_DIV:placeholder${"\uFFFD/#1:3\uFFFD"}:CLOSE_TAG_DIV:after ${"\uFFFD/*4:3\uFFFD"}:CLOSE_BLOCK_PLACEHOLDER:${"\uFFFD*3:2\uFFFD"}:START_BLOCK_LOADING: before${"\uFFFD#1:2\uFFFD"}:START_TAG_BUTTON:loading${"\uFFFD/#1:2\uFFFD"}:CLOSE_TAG_BUTTON:after ${"\uFFFD/*3:2\uFFFD"}:CLOSE_BLOCK_LOADING:${"\uFFFD*5:4\uFFFD"}:START_BLOCK_ERROR: before${"\uFFFD#1:4\uFFFD"}:START_HEADING_LEVEL1:error${"\uFFFD/#1:4\uFFFD"}:CLOSE_HEADING_LEVEL1:after ${"\uFFFD/*5:4\uFFFD"}:CLOSE_BLOCK_ERROR:`;
      }
      return [i18n_0];
    },
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 2, 0)(3, MyApp_DeferLoading_3_Template, 2, 0)(
          4,
          MyApp_DeferPlaceholder_4_Template,
          2,
          0
        )(5, MyApp_DeferError_5_Template, 2, 0);
        i0.ɵɵdefer(6, 2, null, 3, 4, 5);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(6);
        i0.ɵɵdeferWhen(ctx.isLoaded);
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
      @defer (when isLoaded) {
        before<span>middle</span>after
      } @placeholder {
        before<div>placeholder</div>after
      } @loading {
        before<button>loading</button>after
      } @error {
        before<h1>error</h1>after
      }
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
    i0.ɵsetClassDebugInfo(MyApp, { className: "MyApp", filePath: "defer.ts", lineNumber: 20 });
})();
