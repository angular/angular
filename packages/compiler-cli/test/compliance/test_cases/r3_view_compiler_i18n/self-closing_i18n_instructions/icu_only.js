decls: 2,
vars: 1,
consts: function() {
  __i18nIcuMsg__('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`]], {})
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
    $r3$.ɵɵi18nExp(ctx.age);
    $r3$.ɵɵi18nApply(1);
  }
}
