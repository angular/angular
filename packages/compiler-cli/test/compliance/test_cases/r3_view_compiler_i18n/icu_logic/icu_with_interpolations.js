function MyComponent_span_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 1);
    $r3$.ɵɵelement(1, "span");
    $r3$.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵi18nExp($ctx_r0$.age)($ctx_r0$.otherAge);
    $r3$.ɵɵi18nApply(0);
  }
}
…
decls: 3,
vars: 4,
consts: function() {
  __i18nIcuMsg__('{VAR_SELECT, select, male {male {INTERPOLATION}} female {female {INTERPOLATION_1}} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`], ['INTERPOLATION', String.raw`\uFFFD1\uFFFD`], ['INTERPOLATION_1', String.raw`\uFFFD2\uFFFD`]], {})
  __i18nIcuMsg__('{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {INTERPOLATION}}}', [['VAR_SELECT', String.raw`\uFFFD0:1\uFFFD`], ['INTERPOLATION', String.raw`\uFFFD1:1\uFFFD`]], {})
  __i18nMsg__(' {$icu} {$startTagSpan} {$icu_1} {$closeTagSpan}', [['startTagSpan', String.raw`\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD`], ['closeTagSpan', String.raw`\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD`], ['icu', '$i18n_0$', '567200399523107034'], ['icu_1', '$i18n_1$', '5762277079421427850']], {original_code: {'startTagSpan': '<span *ngIf="ageVisible">', 'closeTagSpan': '</span>', 'icu': '{gender, select, male {male {{ weight }}} female {female {{ height }}} other {other}}', 'icu_1': '{age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {{ otherAge }}}}'}}, {})
  return [
    $i18n_2$,
    [__AttributeMarker.Template__, "ngIf"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵtemplate(2, MyComponent_span_2_Template, 2, 2, "span", 1);
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵproperty("ngIf", ctx.ageVisible);
    $r3$.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height);
    $r3$.ɵɵi18nApply(1);
  }
}
