$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 1,
  consts: () => {
    let $i18n_0$;
    if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
    /**
     * @suppress {msgDescriptions}
     */
      const $MSG_ID_WITH_SUFFIX$ = goog.getMsg(" The result is {$interpolation} ", {
        "interpolation": "\uFFFD0\uFFFD"
      }, {
        original_code: { "interpolation": "{{result}}" }
      });
      $i18n_0$ = $MSG_ID_WITH_SUFFIX$;
    } else {
      $i18n_0$ = $localize ` The result is ${"\uFFFD0\uFFFD"}:INTERPOLATION: `;
    }
    return [$i18n_0$];
  },
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomElementStart(0, "div");
      $r3$.ɵɵi18n(1, 0);
      $r3$.ɵɵdomElementEnd();
    }
    if (rf & 2) {
      const result_r1 = ctx.value * 2;
      $r3$.ɵɵadvance();
      $r3$.ɵɵi18nExp(result_r1);
      $r3$.ɵɵi18nApply(1);
    }
  },
  …
});
