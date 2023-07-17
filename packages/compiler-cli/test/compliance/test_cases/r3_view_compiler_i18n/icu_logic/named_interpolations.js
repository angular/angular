decls: 2,
vars: 4,
consts: function() {
  __i18nIcuMsg__('{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`], ['PH_A', String.raw`\uFFFD1\uFFFD`], ['PH_B', String.raw`\uFFFD2\uFFFD`], ['PH_WITH_SPACES', String.raw`\uFFFD3\uFFFD`]], {})
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
    $r3$.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height)(ctx.age);
    $r3$.ɵɵi18nApply(1);
  }
}
