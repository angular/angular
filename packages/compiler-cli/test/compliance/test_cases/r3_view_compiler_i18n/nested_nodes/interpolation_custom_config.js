consts: () => {
  __i18nMsg__('{$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{% valueA %}'}}, {})
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
    $r3$.ɵɵadvance();
    $r3$.ɵɵi18nExp(ctx.valueA);
    $r3$.ɵɵi18nApply(1);
  }
}
