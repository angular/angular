// NOTE: Keeping raw content (avoiding `__i18nMsg__` macro) to illustrate message id sanitization.
let $I18N_0$;
if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
  /**
   * @suppress {msgDescriptions}
   */
  const $MSG_EXTERNAL_ID_WITH_INVALID_CHARS$$APP_SPEC_TS_1$ = goog.getMsg("Element title");
  $I18N_0$ = $MSG_EXTERNAL_ID_WITH_INVALID_CHARS$$APP_SPEC_TS_1$;
} else {
  $I18N_0$ = $localize`:@@ID.WITH.INVALID.CHARS:Element title`;
}

…

let $I18N_2$;
if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
  /**
   * @suppress {msgDescriptions}
   */
  const $MSG_EXTERNAL_ID_WITH_INVALID_CHARS_2$$APP_SPEC_TS_4$ = goog.getMsg(" Some content ");
  $I18N_2$ = $MSG_EXTERNAL_ID_WITH_INVALID_CHARS_2$$APP_SPEC_TS_4$;
} else {
  $I18N_2$ = $localize`:@@ID.WITH.INVALID.CHARS.2: Some content `;
}
