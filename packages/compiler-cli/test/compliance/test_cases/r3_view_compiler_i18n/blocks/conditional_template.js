import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "span");
    i0.ɵɵi18nEnd();
  }
}
function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
  }
}
function MyApp_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelement(1, "button");
    i0.ɵɵi18nEnd();
  }
}
function MyApp_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 4);
    i0.ɵɵelement(1, "span");
    i0.ɵɵi18nEnd();
  }
}
export class MyApp {
  count = 0;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 6,
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4037030454066434177$$CONDITIONAL_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " Content: {$startBlockIf} before{$startTagSpan}zero{$closeTagSpan}after {$closeBlockIf}{$startBlockElseIf} before{$startTagDiv}one{$closeTagDiv}after {$closeBlockElseIf}{$startBlockElse} before{$startTagButton}otherwise{$closeTagButton}after {$closeBlockElse}! {$startBlockIf_1} before{$startTagSpan}seven{$closeTagSpan}after {$closeBlockIf}",
            {
              "closeBlockElse": "\uFFFD/*4:3\uFFFD",
              "closeBlockElseIf": "\uFFFD/*3:2\uFFFD",
              "closeBlockIf": "[\uFFFD/*2:1\uFFFD|\uFFFD/*5:4\uFFFD]",
              "closeTagButton": "\uFFFD/#1:3\uFFFD",
              "closeTagDiv": "\uFFFD/#1:2\uFFFD",
              "closeTagSpan": "[\uFFFD/#1:1\uFFFD|\uFFFD/#1:4\uFFFD]",
              "startBlockElse": "\uFFFD*4:3\uFFFD",
              "startBlockElseIf": "\uFFFD*3:2\uFFFD",
              "startBlockIf": "\uFFFD*2:1\uFFFD",
              "startBlockIf_1": "\uFFFD*5:4\uFFFD",
              "startTagButton": "\uFFFD#1:3\uFFFD",
              "startTagDiv": "\uFFFD#1:2\uFFFD",
              "startTagSpan": "[\uFFFD#1:1\uFFFD|\uFFFD#1:4\uFFFD]"
            },
            {
              original_code: {
                "closeBlockElse": "}",
                "closeBlockElseIf": "}",
                "closeBlockIf": "}",
                "closeTagButton": "</button>",
                "closeTagDiv": "</div>",
                "closeTagSpan": "</span>",
                "startBlockElse": "@else {",
                "startBlockElseIf": "@else if (count === 1) {",
                "startBlockIf": "@if (count === 0) {",
                "startBlockIf_1": "@if (count === 7) {",
                "startTagButton": "<button>",
                "startTagDiv": "<div>",
                "startTagSpan": "<span>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_4037030454066434177$$CONDITIONAL_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Content: ${"\uFFFD*2:1\uFFFD"}:START_BLOCK_IF: before${"[\uFFFD#1:1\uFFFD|\uFFFD#1:4\uFFFD]"}:START_TAG_SPAN:zero${"[\uFFFD/#1:1\uFFFD|\uFFFD/#1:4\uFFFD]"}:CLOSE_TAG_SPAN:after ${"[\uFFFD/*2:1\uFFFD|\uFFFD/*5:4\uFFFD]"}:CLOSE_BLOCK_IF:${"\uFFFD*3:2\uFFFD"}:START_BLOCK_ELSE_IF: before${"\uFFFD#1:2\uFFFD"}:START_TAG_DIV:one${"\uFFFD/#1:2\uFFFD"}:CLOSE_TAG_DIV:after ${"\uFFFD/*3:2\uFFFD"}:CLOSE_BLOCK_ELSE_IF:${"\uFFFD*4:3\uFFFD"}:START_BLOCK_ELSE: before${"\uFFFD#1:3\uFFFD"}:START_TAG_BUTTON:otherwise${"\uFFFD/#1:3\uFFFD"}:CLOSE_TAG_BUTTON:after ${"\uFFFD/*4:3\uFFFD"}:CLOSE_BLOCK_ELSE:! ${"\uFFFD*5:4\uFFFD"}:START_BLOCK_IF_1: before${"[\uFFFD#1:1\uFFFD|\uFFFD#1:4\uFFFD]"}:START_TAG_SPAN:seven${"[\uFFFD/#1:1\uFFFD|\uFFFD/#1:4\uFFFD]"}:CLOSE_TAG_SPAN:after ${"[\uFFFD/*2:1\uFFFD|\uFFFD/*5:4\uFFFD]"}:CLOSE_BLOCK_IF:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0];
    },
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 2, 0)(
          3,
          MyApp_Conditional_3_Template,
          2,
          0
        )(4, MyApp_Conditional_4_Template, 2, 0);
        i0.ɵɵconditionalCreate(5, MyApp_Conditional_5_Template, 2, 0);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵconditional(ctx.count === 0 ? 2 : ctx.count === 1 ? 3 : 4);
        i0.ɵɵadvance(3);
        i0.ɵɵconditional(ctx.count === 7 ? 5 : -1);
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
      @if (count === 0) {
        before<span>zero</span>after
      } @else if (count === 1) {
        before<div>one</div>after
      } @else {
        before<button>otherwise</button>after
      }!

      @if (count === 7) {
        before<span>seven</span>after
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "conditional.ts",
      lineNumber: 22
    });
})();
