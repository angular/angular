decls: 9,
vars: 5,
consts: () => {
  __i18nMsg__(' My i18n block #{$interpolation} {$startTagSpan}Plain text in nested element{$closeTagSpan}', [['closeTagSpan', String.raw`\uFFFD/#2\uFFFD`], ['interpolation', String.raw`\uFFFD0\uFFFD`], ['startTagSpan', String.raw`\uFFFD#2\uFFFD`]], {original_code: {'closeTagSpan': '</span>', 'interpolation': '{{ one }}', 'startTagSpan': '<span>'}}, {})
  __i18nMsgWithPostprocess__(' My i18n block #{$interpolation} {$startTagDiv}{$startTagDiv}{$startTagSpan} More bindings in more nested element: {$interpolation_1} {$closeTagSpan}{$closeTagDiv}{$closeTagDiv}', [['closeTagDiv', String.raw`[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]`], ['closeTagSpan', String.raw`\uFFFD/#8\uFFFD`], ['interpolation', String.raw`\uFFFD0\uFFFD`], ['interpolation_1', String.raw`\uFFFD1\uFFFD`], ['startTagDiv', String.raw`[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]`], ['startTagSpan', String.raw`\uFFFD#8\uFFFD`]], {original_code: {'closeTagDiv': '</div>', 'closeTagSpan': '</span>', 'interpolation': '{{ two | uppercase }}', 'interpolation_1': '{{ nestedInBlockTwo }}', 'startTagDiv': '<div>', 'startTagSpan': '<span>'}}, {}, [])
  return [
    $i18n_0$,
    $i18n_1$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵelement(2, "span");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(3, "div");
    $r3$.ɵɵi18nStart(4, 1);
    $r3$.ɵɵpipe(5, "uppercase");
    $r3$.ɵɵelementStart(6, "div")(7, "div");
    $r3$.ɵɵelement(8, "span");
    $r3$.ɵɵelementEnd()();
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp(ctx.one);
    $r3$.ɵɵi18nApply(1);
    $r3$.ɵɵadvance(6);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(5, 3, ctx.two))(ctx.nestedInBlockTwo);
    $r3$.ɵɵi18nApply(4);
  }
}
