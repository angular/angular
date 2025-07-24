function MyApp_Defer_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 1);
    $r3$.ɵɵelement(1, "span");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_DeferLoading_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 2);
    $r3$.ɵɵelement(1, "button");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_DeferPlaceholder_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 3);
    $r3$.ɵɵelement(1, "div");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_DeferError_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 4);
    $r3$.ɵɵelement(1, "h1");
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
      const $MSG_ID_WITH_SUFFIX$ = goog.getMsg(" Content: {$startBlockDefer} before{$startTagSpan}middle{$closeTagSpan}after {$closeBlockDefer}{$startBlockPlaceholder} before{$startTagDiv}placeholder{$closeTagDiv}after {$closeBlockPlaceholder}{$startBlockLoading} before{$startTagButton}loading{$closeTagButton}after {$closeBlockLoading}{$startBlockError} before{$startHeadingLevel1}error{$closeHeadingLevel1}after {$closeBlockError}", {
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
      }, {
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
      });
      i18n_0 = $MSG_ID_WITH_SUFFIX$;
    } else {
      i18n_0 = $localize ` Content: ${"\uFFFD*2:1\uFFFD"}:START_BLOCK_DEFER: before${"\uFFFD#1:1\uFFFD"}:START_TAG_SPAN:middle${"\uFFFD/#1:1\uFFFD"}:CLOSE_TAG_SPAN:after ${"\uFFFD/*2:1\uFFFD"}:CLOSE_BLOCK_DEFER:${"\uFFFD*4:3\uFFFD"}:START_BLOCK_PLACEHOLDER: before${"\uFFFD#1:3\uFFFD"}:START_TAG_DIV:placeholder${"\uFFFD/#1:3\uFFFD"}:CLOSE_TAG_DIV:after ${"\uFFFD/*4:3\uFFFD"}:CLOSE_BLOCK_PLACEHOLDER:${"\uFFFD*3:2\uFFFD"}:START_BLOCK_LOADING: before${"\uFFFD#1:2\uFFFD"}:START_TAG_BUTTON:loading${"\uFFFD/#1:2\uFFFD"}:CLOSE_TAG_BUTTON:after ${"\uFFFD/*3:2\uFFFD"}:CLOSE_BLOCK_LOADING:${"\uFFFD*5:4\uFFFD"}:START_BLOCK_ERROR: before${"\uFFFD#1:4\uFFFD"}:START_HEADING_LEVEL1:error${"\uFFFD/#1:4\uFFFD"}:CLOSE_HEADING_LEVEL1:after ${"\uFFFD/*5:4\uFFFD"}:CLOSE_BLOCK_ERROR:`;
    }
    return [i18n_0];
  },
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵi18nStart(1, 0);
      $r3$.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 2, 0)(3, MyApp_DeferLoading_3_Template, 2, 0)(4, MyApp_DeferPlaceholder_4_Template, 2, 0)(5, MyApp_DeferError_5_Template, 2, 0);
      $r3$.ɵɵdefer(6, 2, null, 3, 4, 5);
      $r3$.ɵɵi18nEnd();
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵadvance(6);
      $r3$.ɵɵdeferWhen(ctx.isLoaded);
    }
  },
  …
});
