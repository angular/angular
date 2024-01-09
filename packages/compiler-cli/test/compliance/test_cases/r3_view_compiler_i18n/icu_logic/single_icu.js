decls: 2,
vars: 1,
consts: () => {
  __i18nIcuMsg__('{VAR_SELECT, select, male {male} female {female} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`]], {})
  __i18nMsg__('before {$icu} after', [['icu', '$i18n_0$', '7670372064920373295']], {original_code: {'icu': '{gender, select, male {male} female {female} other {other}}'}}, {})
  return [$i18n_1$];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵi18nExp(ctx.gender);
    $r3$.ɵɵi18nApply(1);
  }
}
