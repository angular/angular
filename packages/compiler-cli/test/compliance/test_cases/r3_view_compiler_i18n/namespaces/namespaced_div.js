consts: function() {
  let $I18N_0$;
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
    const $MSG_EXTERNAL_7428861019045796010$$APP_SPEC_TS_1$ = goog.getMsg(" Count: {$startTagXhtmlSpan}5{$closeTagXhtmlSpan}", {
      "startTagXhtmlSpan": "\uFFFD#4\uFFFD",
      "closeTagXhtmlSpan": "\uFFFD/#4\uFFFD"
    });
    $I18N_0$ = $MSG_EXTERNAL_7428861019045796010$$APP_SPEC_TS_1$;
  }
  else {
    $I18N_0$ = $localize ` Count: ${"\uFFFD#4\uFFFD"}:START_TAG__XHTML_SPAN:5${"\uFFFD/#4\uFFFD"}:CLOSE_TAG__XHTML_SPAN:`;
  }
  return [
    ["xmlns", "http://www.w3.org/2000/svg"],
    ["xmlns", "http://www.w3.org/1999/xhtml"],
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵnamespaceSVG();
    $r3$.ɵɵelementStart(0, "svg", 0);
    $r3$.ɵɵelementStart(1, "foreignObject");
    $r3$.ɵɵnamespaceHTML();
    $r3$.ɵɵelementStart(2, "div", 1);
    $r3$.ɵɵi18nStart(3, 2);
    $r3$.ɵɵelement(4, "span");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementEnd();
  }
}
