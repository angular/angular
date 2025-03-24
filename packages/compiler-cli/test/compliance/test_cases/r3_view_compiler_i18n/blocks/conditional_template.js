function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 1);
    $r3$.ɵɵelement(1, "span");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 2);
    $r3$.ɵɵelement(1, "div");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 3);
    $r3$.ɵɵelement(1, "button");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 4);
    $r3$.ɵɵelement(1, "span");
    $r3$.ɵɵi18nEnd();
  }
}

…

MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  consts: () => {
    let i18n_0;
    if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      /**
       * @suppress {msgDescriptions}
       */
      const $MSG_ID_WITH_SUFFIX$ = goog.getMsg(" Content: {$startBlockIf} before{$startTagSpan}zero{$closeTagSpan}after {$closeBlockIf}{$startBlockElseIf} before{$startTagDiv}one{$closeTagDiv}after {$closeBlockElseIf}{$startBlockElse} before{$startTagButton}otherwise{$closeTagButton}after {$closeBlockElse}! {$startBlockIf_1} before{$startTagSpan}seven{$closeTagSpan}after {$closeBlockIf}", {
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
      }, {
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
      });
      i18n_0 = $MSG_ID_WITH_SUFFIX$;
    } else {
      i18n_0 = $localize` Content: ${"\uFFFD*2:1\uFFFD"}:START_BLOCK_IF: before${"[\uFFFD#1:1\uFFFD|\uFFFD#1:4\uFFFD]"}:START_TAG_SPAN:zero${"[\uFFFD/#1:1\uFFFD|\uFFFD/#1:4\uFFFD]"}:CLOSE_TAG_SPAN:after ${"[\uFFFD/*2:1\uFFFD|\uFFFD/*5:4\uFFFD]"}:CLOSE_BLOCK_IF:${"\uFFFD*3:2\uFFFD"}:START_BLOCK_ELSE_IF: before${"\uFFFD#1:2\uFFFD"}:START_TAG_DIV:one${"\uFFFD/#1:2\uFFFD"}:CLOSE_TAG_DIV:after ${"\uFFFD/*3:2\uFFFD"}:CLOSE_BLOCK_ELSE_IF:${"\uFFFD*4:3\uFFFD"}:START_BLOCK_ELSE: before${"\uFFFD#1:3\uFFFD"}:START_TAG_BUTTON:otherwise${"\uFFFD/#1:3\uFFFD"}:CLOSE_TAG_BUTTON:after ${"\uFFFD/*4:3\uFFFD"}:CLOSE_BLOCK_ELSE:! ${"\uFFFD*5:4\uFFFD"}:START_BLOCK_IF_1: before${"[\uFFFD#1:1\uFFFD|\uFFFD#1:4\uFFFD]"}:START_TAG_SPAN:seven${"[\uFFFD/#1:1\uFFFD|\uFFFD/#1:4\uFFFD]"}:CLOSE_TAG_SPAN:after ${"[\uFFFD/*2:1\uFFFD|\uFFFD/*5:4\uFFFD]"}:CLOSE_BLOCK_IF:`;
    }
    i18n_0 = $r3$.ɵɵi18nPostprocess(i18n_0);
    return [i18n_0];
  },
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵi18nStart(1, 0);
      $r3$.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 2, 0)(3, MyApp_Conditional_3_Template, 2, 0)(4, MyApp_Conditional_4_Template, 2, 0);
      $r3$.ɵɵconditionalCreate(5, MyApp_Conditional_5_Template, 2, 0);
      $r3$.ɵɵi18nEnd();
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵconditional(ctx.count === 0 ? 2 : ctx.count === 1 ? 3 : 4);
      $r3$.ɵɵadvance(3);
      $r3$.ɵɵconditional(ctx.count === 7 ? 5 : -1);
    }
  },
  …
});
