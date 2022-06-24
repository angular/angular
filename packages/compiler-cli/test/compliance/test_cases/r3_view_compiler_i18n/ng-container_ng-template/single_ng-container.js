decls: 3,
vars: 3,
consts: function() {
  __i18nMsg__('Some content: {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ valueA | uppercase }}'}}, {})
  return [
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementContainerStart(0);
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵpipe(2, "uppercase");
    $r3$.ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, 1, ctx.valueA));
    $r3$.ɵɵi18nApply(1);
  }
}
