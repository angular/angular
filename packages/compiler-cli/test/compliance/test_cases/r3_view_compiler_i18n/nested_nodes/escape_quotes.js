// NOTE: Keeping raw content (avoiding `__i18nMsg__` macro) to illustrate quotes escaping.
let $I18N_0$;
if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
    const $MSG_EXTERNAL_4924931801512133405$$APP_SPEC_TS_0$ = goog.getMsg("Some text 'with single quotes', \"with double quotes\", `with backticks` and without quotes.");
    $I18N_0$ = $MSG_EXTERNAL_4924931801512133405$$APP_SPEC_TS_0$;
}
else {
    $I18N_0$ = $localize `Some text 'with single quotes', "with double quotes", \`with backticks\` and without quotes.`;
}
