function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 1);
    $r3$.ɵɵelement(1, "span");
    $r3$.ɵɵi18nEnd();
  }
}

function MyApp_ForEmpty_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 2);
    $r3$.ɵɵelement(1, "div");
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
      const $MSG_ID_WITH_SUFFIX$ = goog.getMsg(" Content: {$startBlockFor} before{$startTagSpan}middle{$closeTagSpan}after {$closeBlockFor}{$startBlockEmpty} before{$startTagDiv}empty{$closeTagDiv}after {$closeBlockEmpty}! ", {
        "closeBlockEmpty": "\uFFFD/*4:2\uFFFD",
        "closeBlockFor": "\uFFFD/*3:1\uFFFD",
        "closeTagDiv": "\uFFFD/#1:2\uFFFD",
        "closeTagSpan": "\uFFFD/#1:1\uFFFD",
        "startBlockEmpty": "\uFFFD*4:2\uFFFD",
        "startBlockFor": "\uFFFD*3:1\uFFFD",
        "startTagDiv": "\uFFFD#1:2\uFFFD",
        "startTagSpan": "\uFFFD#1:1\uFFFD"
      }, {
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
      });
      i18n_0 = $MSG_ID_WITH_SUFFIX$;
    } else {
      i18n_0 = $localize` Content: ${"\uFFFD*3:1\uFFFD"}:START_BLOCK_FOR: before${"\uFFFD#1:1\uFFFD"}:START_TAG_SPAN:middle${"\uFFFD/#1:1\uFFFD"}:CLOSE_TAG_SPAN:after ${"\uFFFD/*3:1\uFFFD"}:CLOSE_BLOCK_FOR:${"\uFFFD*4:2\uFFFD"}:START_BLOCK_EMPTY: before${"\uFFFD#1:2\uFFFD"}:START_TAG_DIV:empty${"\uFFFD/#1:2\uFFFD"}:CLOSE_TAG_DIV:after ${"\uFFFD/*4:2\uFFFD"}:CLOSE_BLOCK_EMPTY:! `;
    }
    return [i18n_0];
  },
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵi18nStart(1, 0);
      $r3$.ɵɵrepeaterCreate(2, MyApp_For_3_Template, 2, 0, null, null, $r3$.ɵɵrepeaterTrackByIdentity, false, MyApp_ForEmpty_4_Template, 2, 0);
      $r3$.ɵɵi18nEnd();
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵrepeater(ctx.items);
    }
  },
  …
});
