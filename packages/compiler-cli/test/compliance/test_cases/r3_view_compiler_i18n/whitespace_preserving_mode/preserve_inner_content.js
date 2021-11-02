consts: function() {
  // NOTE: Keeping raw content (avoiding `i18nMsg`) to illustrate message layout in case of whitespace preserving mode.
  let $I18N_0$;
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      const $MSG_EXTERNAL_963542717423364282$$APP_SPEC_TS_0$ = goog.getMsg("\n    Some text\n    {$startTagSpan}Text inside span{$closeTagSpan}\n  ", {
        "startTagSpan": "\uFFFD#3\uFFFD",
        "closeTagSpan": "\uFFFD/#3\uFFFD"
      });
      $I18N_0$ = $MSG_EXTERNAL_963542717423364282$$APP_SPEC_TS_0$;
  }
  else {
      $I18N_0$ = $localize `
    Some text
    ${"\uFFFD#3\uFFFD"}:START_TAG_SPAN:Text inside span${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_SPAN:
  `;
  }
  return [
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "\n  ");
    $r3$.ɵɵelementStart(1, "div");
    $r3$.ɵɵi18nStart(2, 0);
    $r3$.ɵɵelement(3, "span");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵtext(4, "\n");
  }
}
