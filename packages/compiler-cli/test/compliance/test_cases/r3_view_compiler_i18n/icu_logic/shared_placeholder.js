function MyComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
      $r3$.ɵɵi18nStart(0, 0, 1);
      $r3$.ɵɵelement(1, "div");
      $r3$.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance();
    $r3$.ɵɵi18nExp($ctx_r0$.gender);
    $r3$.ɵɵi18nApply(0);
  }
}
…
decls: 4,
vars: 3,
consts: () => {
  // NOTE: Keeping raw content here to illustrate the difference in placeholders generated for goog.getMsg and $localize calls (see last i18n block).
  let $I18N_1$;
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      /**
       * @suppress {msgDescriptions}
       */
      const $MSG_APP_SPEC_TS_1$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
      $I18N_1$ = $MSG_APP_SPEC_TS_1$;
  }
  else {
      $I18N_1$ = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
  }
  $I18N_1$ = $r3$.ɵɵi18nPostprocess($I18N_1$, {
    "VAR_SELECT": "\uFFFD0\uFFFD"
  });

  let $I18N_2$;
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      /**
       * @suppress {msgDescriptions}
       */
      const $MSG_APP_SPEC_TS_2$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
      $I18N_2$ = $MSG_APP_SPEC_TS_2$;
  }
  else {
      $I18N_2$ = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
  }
  $I18N_2$ = $r3$.ɵɵi18nPostprocess($I18N_2$, {
    "VAR_SELECT": "\uFFFD1\uFFFD"
  });

  let $I18N_4$;
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      /**
       * @suppress {msgDescriptions}
       */
      const $MSG_APP_SPEC_TS__4$ = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
      $I18N_4$ = $MSG_APP_SPEC_TS__4$;
  }
  else {
      $I18N_4$ = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
  }
  $I18N_4$ = $r3$.ɵɵi18nPostprocess($I18N_4$, {
    "VAR_SELECT": "\uFFFD0:1\uFFFD"
  });

  let $I18N_0$;
  if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      /**
       * @suppress {msgDescriptions}
       */
      const $MSG_APP_SPEC_TS_0$ = goog.getMsg(" {$icu} {$startTagDiv} {$icu} {$closeTagDiv}{$startTagDiv_1} {$icu} {$closeTagDiv}", {
        "closeTagDiv": "[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]",
        "icu": "\uFFFDI18N_EXP_ICU\uFFFD",
        "startTagDiv": "\uFFFD#2\uFFFD",
        "startTagDiv_1": "\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD"
      }, {
        original_code: {
          "closeTagDiv": "</div>",
          "icu": "{gender, select, male {male} female {female} other {other}}",
          "startTagDiv": "<div>",
          "startTagDiv_1": "<div *ngIf=\"visible\">"
        }
      });
      $I18N_0$ = $MSG_APP_SPEC_TS_0$;
  }
  else {
      $I18N_0$ = $localize ` ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU@@7670372064920373295: ${"\uFFFD#2\uFFFD"}:START_TAG_DIV: ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU@@7670372064920373295: ${"[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]"}:CLOSE_TAG_DIV:${"\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_DIV_1: ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU@@7670372064920373295: ${"[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]"}:CLOSE_TAG_DIV:`;
  }

  $I18N_0$ = $r3$.ɵɵi18nPostprocess($I18N_0$, {
    "ICU": [$I18N_1$, $I18N_2$, $I18N_4$]
  });
  return [
    $i18n_0$,
    [__AttributeMarker.Template__, "ngIf"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵelement(2, "div");
    $r3$.ɵɵtemplate(3, MyComponent_div_3_Template, 2, 1, "div", 1);
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(3);
    $r3$.ɵɵproperty("ngIf", ctx.visible);
    $r3$.ɵɵi18nExp(ctx.gender)(ctx.gender);
    $r3$.ɵɵi18nApply(1);
  }
}

// NOTE: TODO(FW-635): this use-case is currently supported with file-based prefix for translation const names.
// NOTE: Translation statements caching is required to support this use-case with id-based consts.
