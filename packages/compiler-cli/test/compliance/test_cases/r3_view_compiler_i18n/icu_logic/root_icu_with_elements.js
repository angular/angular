consts: () => {
	let i18n_0;
	if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
		/**
		 * @desc someText1
		 */
		const $MSG_EXTERNAL_4505060179465988919ICU_WHITESPACE_TS_1$ = goog.getMsg("{VAR_SELECT, select, WEBSITE {{START_TAG_STRONG}someText{CLOSE_TAG_STRONG}\n      }}");
		i18n_0 = $MSG_EXTERNAL_4505060179465988919ICU_WHITESPACE_TS_1$;
	} else {
        …
	} i18n_0 = $r3$.ɵɵi18nPostprocess(i18n_0, { "CLOSE_TAG_STRONG": "</strong>", "START_TAG_STRONG": "<strong>", "VAR_SELECT": "\uFFFD0\uFFFD" });
	let i18n_1;
	if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
		/**
		 * @suppress {msgDescriptions}
		 */
		const $MSG_EXTERNAL_4505060179465988919ICU_WHITESPACE_TS_3$ = goog.getMsg("{VAR_SELECT, select, WEBSITE {{START_TAG_STRONG}someText{CLOSE_TAG_STRONG}\n      }}");
		i18n_1 = $MSG_EXTERNAL_4505060179465988919ICU_WHITESPACE_TS_3$;
	} else {
        …
	}
	i18n_1 = $r3$.ɵɵi18nPostprocess(i18n_1, { "CLOSE_TAG_STRONG": "</strong>", "START_TAG_STRONG": "<strong>", "VAR_SELECT": "\uFFFD0\uFFFD" });
	return [i18n_0, i18n_1];
}
…

function MyComponent_Template(rf, ctx) {
	if (rf & 1) {
		$r3$.ɵɵdomElementStart(0, "span");
		$r3$.ɵɵi18n(1, 0);
		$r3$.ɵɵdomElementEnd();
		$r3$.ɵɵdomElementStart(2, "span");
		$r3$.ɵɵtext(3, " ");
		$r3$.ɵɵi18n(4, 1);
		$r3$.ɵɵtext(5, " ");
		$r3$.ɵɵdomElementEnd();
	} if (rf & 2) {
		$r3$.ɵɵadvance();
		$r3$.ɵɵi18nExp(ctx.someField);
		$r3$.ɵɵi18nApply(1);
		$r3$.ɵɵadvance(3);
		$r3$.ɵɵi18nExp(ctx.someField);
		$r3$.ɵɵi18nApply(4);
	}
}
