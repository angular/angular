function MyComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 1);
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵi18nExp($ctx_r0$.age);
    $r3$.ɵɵi18nApply(0);
  }
}
…
decls: 3,
vars: 1,
consts: function() {
  __i18nIcuMsg__('{VAR_SELECT, select, male {male} female {female} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`]])
  __i18nIcuMsg__('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`]])
  return [
    $i18n_0$,
    $i18n_1$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementContainerStart(0);
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵelementContainerEnd();
    $r3$.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 1, 1, "ng-template");
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵi18nExp(ctx.gender);
    $r3$.ɵɵi18nApply(1);
  }
}
