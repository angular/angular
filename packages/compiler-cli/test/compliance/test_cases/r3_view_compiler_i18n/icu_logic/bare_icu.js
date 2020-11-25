function $MyComponent_div_2_Template$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 3);
    $r3$.ɵɵtext(1, " ");
    $r3$.ɵɵi18n(2, 4);
    $r3$.ɵɵtext(3, " ");
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp($ctx_r0$.age);
    $r3$.ɵɵi18nApply(2);
  }
}
…
function $MyComponent_div_3_Template$(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 5);
    $r3$.ɵɵtext(1, " You have ");
    $r3$.ɵɵi18n(2, 6);
    $r3$.ɵɵtext(3, ". ");
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $ctx_r1$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp($ctx_r1$.count)($ctx_r1$.count);
    $r3$.ɵɵi18nApply(2);
  }
}
…
decls: 4,
vars: 3,
consts: function() {
  __i18nIcuMsg__('{VAR_SELECT, select, male {male} female {female} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`]]) __i18nIcuMsg__('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}', [['VAR_SELECT', String.raw`\uFFFD0\uFFFD`]])
  __i18nIcuMsg__('{VAR_SELECT, select, 0 {no emails} 1 {one email} other {{INTERPOLATION} emails}}', [ ['VAR_SELECT', String.raw`\uFFFD0\uFFFD`], ['INTERPOLATION', String.raw`\uFFFD1\uFFFD`]])
  return [
    $i18n_0$,
    ["title", "icu only", __AttributeMarker.Template__, "ngIf"],
    ["title", "icu and text", __AttributeMarker.Template__, "ngIf"],
    ["title", "icu only"],
    $i18n_1$,
    ["title", "icu and text"],
    $i18n_2$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵtemplate(2, $MyComponent_div_2_Template$, 4, 1, "div", 1);
    $r3$.ɵɵtemplate(3, $MyComponent_div_3_Template$, 4, 2, "div", 2);
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵi18nExp(ctx.gender);
    $r3$.ɵɵi18nApply(1);
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵproperty("ngIf", ctx.visible);
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵproperty("ngIf", ctx.available);
  }
}
