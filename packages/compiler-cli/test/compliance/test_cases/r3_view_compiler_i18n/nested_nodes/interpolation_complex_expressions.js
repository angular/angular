consts: () => {
  __i18nMsg__(' {$interpolation} {$interpolation_1} {$interpolation_2} ', [['interpolation', String.raw`\uFFFD0\uFFFD`], ['interpolation_1', String.raw`\uFFFD1\uFFFD`], ['interpolation_2', String.raw`\uFFFD2\uFFFD`]], {original_code: {'interpolation': '{{ valueA | async }}', 'interpolation_1': '{{ valueA?.a?.b }}', 'interpolation_2': '{{ valueA.getRawValue()?.getTitle() }}'}}, {})
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
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 3, ctx.valueA))(ctx.valueA?.a?.b)(ctx.valueA.getRawValue()?.getTitle());
    i0.ɵɵi18nApply(1);
  }
}
