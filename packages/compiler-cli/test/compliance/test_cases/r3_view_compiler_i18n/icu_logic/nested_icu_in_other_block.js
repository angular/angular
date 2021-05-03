decls: 2,
vars: 3,
consts: function() {
  __i18nIcuMsg__('{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}} !} other {other - {INTERPOLATION}}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`], ['VAR_PLURAL', String.raw`\uFFFD1\uFFFD`], ['INTERPOLATION', String.raw`\uFFFD2\uFFFD`]])
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
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵi18nExp(ctx.name)(ctx.count)(ctx.count);
    $r3$.ɵɵi18nApply(1);
  }
}
