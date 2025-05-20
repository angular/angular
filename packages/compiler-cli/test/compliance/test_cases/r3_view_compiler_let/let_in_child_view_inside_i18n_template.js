function MyApp_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 0, 1);
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $result_r1$ = $r3$.ɵɵreadContextLet(2);
    $r3$.ɵɵi18nExp($result_r1$);
    $r3$.ɵɵi18nApply(0);
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 4,
  vars: 1,
  consts: () => {
    let $i18n_0$;
    if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
      /**
       * @suppress {msgDescriptions}
       */
      const $MSG_ID_WITH_SUFFIX$ = goog.getMsg("{$startTagNgTemplate}The result is {$interpolation}{$closeTagNgTemplate}", {
        "closeTagNgTemplate": "\uFFFD/*3:1\uFFFD",
        "interpolation": "\uFFFD0:1\uFFFD",
        "startTagNgTemplate": "\uFFFD*3:1\uFFFD"
      }, {
        original_code: {
          "closeTagNgTemplate": "</ng-template>",
          "interpolation": "{{result}}",
          "startTagNgTemplate": "<ng-template>"
        }
      });
      $i18n_0$ = $MSG_ID_WITH_SUFFIX$;
    } else {
      $i18n_0$ = $localize `${"\uFFFD*3:1\uFFFD"}:START_TAG_NG_TEMPLATE:The result is ${"\uFFFD0:1\uFFFD"}:INTERPOLATION:${"\uFFFD/*3:1\uFFFD"}:CLOSE_TAG_NG_TEMPLATE:`;
    }
    return [$i18n_0$];
  },
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵi18nStart(1, 0);
      $r3$.ɵɵdeclareLet(2);
      $r3$.ɵɵtemplate(3, MyApp_ng_template_3_Template, 1, 1, "ng-template");
      $r3$.ɵɵi18nEnd();
      $r3$.ɵɵelementEnd();
    }
    if (rf & 2) {
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵstoreLet(ctx.value * 2);
    }
  },
  …
});
