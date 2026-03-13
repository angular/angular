function MyApp_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $result_r1$ = $r3$.ɵɵreadContextLet(2);
    $r3$.ɵɵtextInterpolate1("The result is ", $result_r1$);
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 4,
  vars: 2,
  consts: () => {
    let $i18n_0$;
    if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      /**
       * @suppress {msgDescriptions}
       */
      const $MSG_ID_WITH_SUFFIX$ = /* @ts-ignore */ goog.getMsg("Hello {$interpolation}", {
        "interpolation": "\uFFFD0\uFFFD"
      }, {
        original_code: { "interpolation": "{{value}}" }
      });
      $i18n_0$ = $MSG_ID_WITH_SUFFIX$;
    } else {
      /* @ts-ignore */
      $i18n_0$ = $localize `Hello ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    }
    return [$i18n_0$];
  },
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomElementStart(0, "div");
      $r3$.ɵɵi18n(1, 0);
      $r3$.ɵɵdomElementEnd();
      $r3$.ɵɵdeclareLet(2);
      $r3$.ɵɵdomTemplate(3, MyApp_ng_template_3_Template, 1, 1, "ng-template");
    }
    if (rf & 2) {
      $r3$.ɵɵadvance();
      $r3$.ɵɵi18nExp(ctx.value);
      $r3$.ɵɵi18nApply(1);
      $r3$.ɵɵadvance();
      $r3$.ɵɵstoreLet(ctx.value * 2);
    }
  },
  …
});
