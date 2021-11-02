decls: 7,
vars: 5,
consts: function() {
  __i18nMsg__('My i18n block #{$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {})
  __i18nMsg__('My i18n block #{$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {})
  __i18nMsg__('My i18n block #{$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {})
  return [
    $i18n_0$,
    $i18n_1$,
    $i18n_2$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(2, "div");
    $r3$.ɵɵi18n(3, 1);
    $r3$.ɵɵpipe(4, "uppercase");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(5, "div");
    $r3$.ɵɵi18n(6, 2);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵi18nExp(ctx.one);
    $r3$.ɵɵi18nApply(1);
    $r3$.ɵɵadvance(3);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(4, 3, ctx.two));
    $r3$.ɵɵi18nApply(3);
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp(ctx.three + ctx.four + ctx.five);
    $r3$.ɵɵi18nApply(6);
  }
}