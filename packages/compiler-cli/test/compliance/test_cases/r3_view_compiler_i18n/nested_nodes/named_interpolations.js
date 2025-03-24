// NOTE: Keeping raw content (avoiding `__i18nMsg__` macro) to illustrate how named interpolations are generated.
decls: 2,
vars: 2,
consts: () => {
  let $I18N_0$;
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      /**
       * @suppress {msgDescriptions}
       */
      const $MSG_EXTERNAL_7597881511811528589$$APP_SPEC_TS_0$ = goog.getMsg(" Named interpolation: {$phA} Named interpolation with spaces: {$phB} ", {
        "phB": "\uFFFD1\uFFFD",
        "phA": "\uFFFD0\uFFFD"
      }, {
        original_code: {
          "phB": "{{ valueB // i18n(ph=\"PH B\") }}",
          "phA": "{{ valueA // i18n(ph=\"PH_A\") }}"
        }
      });
      $I18N_0$ = $MSG_EXTERNAL_7597881511811528589$$APP_SPEC_TS_0$;
  }
  else {
      $I18N_0$ = $localize ` Named interpolation: ${"\uFFFD0\uFFFD"}:PH_A: Named interpolation with spaces: ${"\uFFFD1\uFFFD"}:PH_B: `;
  }
  return [
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵi18nExp(ctx.valueA)(ctx.valueB);
    $r3$.ɵɵi18nApply(1);
  }
}
