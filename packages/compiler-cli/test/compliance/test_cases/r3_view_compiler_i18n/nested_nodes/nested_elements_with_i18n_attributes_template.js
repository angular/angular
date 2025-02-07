decls: 9,
vars: 7,
consts: () => {
  __i18nMsg__('Span title {$interpolation} and {$interpolation_1}', [['interpolation', String.raw`\uFFFD0\uFFFD`], ['interpolation_1', String.raw`\uFFFD1\uFFFD`]], {original_code: {'interpolation': '{{ valueB }}', 'interpolation_1': '{{ valueC }}'}}, {})
  __i18nMsg__('Span title {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ valueE }}'}}, {})
  __i18nMsg__(' My i18n block #1 with value: {$interpolation} {$startTagSpan} Plain text in nested element (block #1) {$closeTagSpan}',[['closeTagSpan', String.raw`\uFFFD/#2\uFFFD`], ['interpolation', String.raw`\uFFFD0\uFFFD`], ['startTagSpan', String.raw`\uFFFD#2\uFFFD`]], {original_code: {'closeTagSpan': '</span>', 'interpolation': '{{ valueA }}', 'startTagSpan': '<span i18n-title title="Span title {{ valueB }} and {{ valueC }}">'}}, {})
  __i18nMsg__(' My i18n block #2 with value {$interpolation} {$startTagSpan} Plain text in nested element (block #2) {$closeTagSpan}',[['closeTagSpan', String.raw`\uFFFD/#7\uFFFD`], ['interpolation', String.raw`\uFFFD0\uFFFD`], ['startTagSpan', String.raw`\uFFFD#7\uFFFD`]], {original_code: {'closeTagSpan': '</span>', 'interpolation': '{{ valueD | uppercase }}', 'startTagSpan': '<span i18n-title title="Span title {{ valueE }}">'}}, {})
  return [
    $i18n_0$,
    $i18n_2$,
    ["title", $i18n_1$],
    ["title", $i18n_3$],
    [__AttributeMarker.I18n__, "title"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵelementStart(2, "span", 4);
    $r3$.ɵɵi18nAttributes(3, 2);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(4, "div");
    $r3$.ɵɵi18nStart(5, 1);
    $r3$.ɵɵpipe(6, "uppercase");
    $r3$.ɵɵelementStart(7, "span", 4);
    $r3$.ɵɵi18nAttributes(8, 3);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp(ctx.valueB)(ctx.valueC);
    $r3$.ɵɵi18nApply(3);
    $r3$.ɵɵadvance();
    $r3$.ɵɵi18nExp(ctx.valueA);
    $r3$.ɵɵi18nApply(1);
    $r3$.ɵɵadvance(4);
    $r3$.ɵɵi18nExp(ctx.valueE);
    $r3$.ɵɵi18nApply(8);
    $r3$.ɵɵadvance();
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(6, 5, ctx.valueD));
    $r3$.ɵɵi18nApply(5);
  }
}
