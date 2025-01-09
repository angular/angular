
consts: () => {
  let $I18N_0$;
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
    /**
     * @suppress {msgDescriptions}
     */
    const $MSG_EXTERNAL_7128002169381370313$$APP_SPEC_TS_1$ = goog.getMsg("{$startTagXhtmlDiv} Count: {$startTagXhtmlSpan}5{$closeTagXhtmlSpan}{$closeTagXhtmlDiv}", {
      "closeTagXhtmlDiv": "\uFFFD/#3\uFFFD",
      "closeTagXhtmlSpan": "\uFFFD/#4\uFFFD",
      "startTagXhtmlDiv": "\uFFFD#3\uFFFD",
      "startTagXhtmlSpan": "\uFFFD#4\uFFFD"
    }, {
      original_code: {
        "closeTagXhtmlDiv": "</xhtml:div>",
        "closeTagXhtmlSpan": "</span>",
        "startTagXhtmlDiv": "<xhtml:div xmlns=\"http://www.w3.org/1999/xhtml\">",
        "startTagXhtmlSpan": "<span>"
      }
    });
    $I18N_0$ = $MSG_EXTERNAL_7128002169381370313$$APP_SPEC_TS_1$;
  }
  else {
    $I18N_0$ = $localize `${"\uFFFD#3\uFFFD"}:START_TAG__XHTML_DIV: Count: ${"\uFFFD#4\uFFFD"}:START_TAG__XHTML_SPAN:5${"\uFFFD/#4\uFFFD"}:CLOSE_TAG__XHTML_SPAN:${"\uFFFD/#3\uFFFD"}:CLOSE_TAG__XHTML_DIV:`;
  }
  return [
    $i18n_0$,
    ["xmlns", "http://www.w3.org/2000/svg"],
    ["xmlns", "http://www.w3.org/1999/xhtml"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵnamespaceSVG();
    $r3$.ɵɵelementStart(0, "svg", 1)(1, "foreignObject");
    $r3$.ɵɵi18nStart(2, 0);
    $r3$.ɵɵnamespaceHTML();
    $r3$.ɵɵelementStart(3, "div", 2);
    $r3$.ɵɵelement(4, "span");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd()();
  }
}
