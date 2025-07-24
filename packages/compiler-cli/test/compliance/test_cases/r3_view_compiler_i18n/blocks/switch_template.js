function MyApp_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 1);
    $r3$.ɵɵelement(1, "span");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 2);
    $r3$.ɵɵelement(1, "div");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 3);
    $r3$.ɵɵelement(1, "button");
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
      const $MSG_ID_WITH_SUFFIX$ = goog.getMsg(" Content: {$startBlockCase}before{$startTagSpan}zero{$closeTagSpan}after{$closeBlockCase}{$startBlockCase_1}before{$startTagDiv}one{$closeTagDiv}after{$closeBlockCase}{$startBlockDefault}before{$startTagButton}otherwise{$closeTagButton}after{$closeBlockDefault}", {
        "closeBlockCase": "[\uFFFD/*2:1\uFFFD|\uFFFD/*3:2\uFFFD]",
        "closeBlockDefault": "\uFFFD/*4:3\uFFFD",
        "closeTagButton": "\uFFFD/#1:3\uFFFD",
        "closeTagDiv": "\uFFFD/#1:2\uFFFD",
        "closeTagSpan": "\uFFFD/#1:1\uFFFD",
        "startBlockCase": "\uFFFD*2:1\uFFFD",
        "startBlockCase_1": "\uFFFD*3:2\uFFFD",
        "startBlockDefault": "\uFFFD*4:3\uFFFD",
        "startTagButton": "\uFFFD#1:3\uFFFD",
        "startTagDiv": "\uFFFD#1:2\uFFFD",
        "startTagSpan": "\uFFFD#1:1\uFFFD"
      }, {
        original_code: {
          "closeBlockCase": "}",
          "closeBlockDefault": "}",
          "closeTagButton": "</button>",
          "closeTagDiv": "</div>",
          "closeTagSpan": "</span>",
          "startBlockCase": "@case (0) {",
          "startBlockCase_1": "@case (1) {",
          "startBlockDefault": "@default {",
          "startTagButton": "<button>",
          "startTagDiv": "<div>",
          "startTagSpan": "<span>"
        }
      });
      i18n_0 = $MSG_ID_WITH_SUFFIX$;
    } else {
      i18n_0 = $localize` Content: ${"\uFFFD*2:1\uFFFD"}:START_BLOCK_CASE:before${"\uFFFD#1:1\uFFFD"}:START_TAG_SPAN:zero${"\uFFFD/#1:1\uFFFD"}:CLOSE_TAG_SPAN:after${"[\uFFFD/*2:1\uFFFD|\uFFFD/*3:2\uFFFD]"}:CLOSE_BLOCK_CASE:${"\uFFFD*3:2\uFFFD"}:START_BLOCK_CASE_1:before${"\uFFFD#1:2\uFFFD"}:START_TAG_DIV:one${"\uFFFD/#1:2\uFFFD"}:CLOSE_TAG_DIV:after${"[\uFFFD/*2:1\uFFFD|\uFFFD/*3:2\uFFFD]"}:CLOSE_BLOCK_CASE:${"\uFFFD*4:3\uFFFD"}:START_BLOCK_DEFAULT:before${"\uFFFD#1:3\uFFFD"}:START_TAG_BUTTON:otherwise${"\uFFFD/#1:3\uFFFD"}:CLOSE_TAG_BUTTON:after${"\uFFFD/*4:3\uFFFD"}:CLOSE_BLOCK_DEFAULT:`;
    }
    i18n_0 = $r3$.ɵɵi18nPostprocess(i18n_0);
    return [i18n_0];
  },
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵi18nStart(1, 0);
      $r3$.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 2, 0)(3, MyApp_Case_3_Template, 2, 0)(4, MyApp_Case_4_Template, 2, 0);
      $r3$.ɵɵi18nEnd();
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      let $MyApp_contFlowTmp$;
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵconditional(($MyApp_contFlowTmp$ = ctx.count) === 0 ? 2 : $MyApp_contFlowTmp$ === 1 ? 3 : 4);
    }
  },
  …
});
