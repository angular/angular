decls: 2,
vars: 2,
consts: () => {
  __i18nIcuMsg__('{VAR_SELECT_1, select, male {male of age: {VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}} female {female} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`], ['VAR_SELECT_1', String.raw`\uFFFD1\uFFFD`]], {})
  __i18nMsg__(' {$icu} ', [['icu', '$i18n_0$', '2960440207608193372']], {original_code: {'icu': '{gender, select,\\n      male {male of age: {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}}\\n      female {female}\\n      other {other}\\n    }'}}, {})
  return [
    $i18n_1$
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
    $r3$.ɵɵi18nExp(ctx.age)(ctx.gender);
    $r3$.ɵɵi18nApply(1);
  }
}
