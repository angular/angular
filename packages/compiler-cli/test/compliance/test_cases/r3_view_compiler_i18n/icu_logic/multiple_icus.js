decls: 2,
vars: 2,
consts: function() {
  __i18nIcuMsg__('{VAR_SELECT, select, male {male} female {female} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`]], {})
  __i18nIcuMsg__('{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}', [['VAR_SELECT', String.raw`\uFFFD1\uFFFD`]], {})
  __i18nMsg__(' {$icu} {$icu_1} ', [['icu', '$i18n_0$', '7670372064920373295'], ['icu_1', '$i18n_1$', '4590395557003415341']], {original_code: {'icu': '{gender, select, male {male} female {female} other {other}}', 'icu_1': '{age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}'}}, {})
  return [
    $i18n_2$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵi18nExp(ctx.gender)(ctx.age);
    $r3$.ɵɵi18nApply(1);
  }
}
