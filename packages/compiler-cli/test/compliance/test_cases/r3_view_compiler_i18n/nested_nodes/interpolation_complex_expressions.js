consts: function() {
  __i18nMsg__(' {$interpolation} {$interpolation_1} {$interpolation_2} ', [['interpolation', String.raw`\uFFFD0\uFFFD`], ['interpolation_1', String.raw`\uFFFD1\uFFFD`], ['interpolation_2', String.raw`\uFFFD2\uFFFD`]], {})
  return [
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵpipe(2, "async");
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $tmp_2_0$ = null;
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, 3, ctx.valueA))
                  (ctx.valueA == null ? null : ctx.valueA.a == null ? null : ctx.valueA.a.b)
                  (($tmp_2_0$ = ctx.valueA.getRawValue()) == null ? null : $tmp_2_0$.getTitle());
    $r3$.ɵɵi18nApply(1);
  }
}