consts: () => {
  __i18nMsg__('{$interpolation} and {$interpolation_1}', [['interpolation', String.raw`\uFFFD0\uFFFD`], ['interpolation_1', String.raw`\uFFFD1\uFFFD`]], {original_code: {'interpolation': '{{ valueA | pipeA }}', 'interpolation_1': '{{ valueB | pipeB }}'}}, {})
  __i18nMsg__('{$startTagSpan}{$interpolation}{$closeTagSpan} and {$interpolation_1} {$startTagSpan}and {$interpolation_2}{$closeTagSpan}', [['closeTagSpan', String.raw`[\uFFFD/#6\uFFFD|\uFFFD/#9\uFFFD]`], ['interpolation', String.raw`\uFFFD0\uFFFD`], ['interpolation_1', String.raw`\uFFFD1\uFFFD`], ['interpolation_2', String.raw`\uFFFD2\uFFFD`], ['startTagSpan', String.raw`[\uFFFD#6\uFFFD|\uFFFD#9\uFFFD]`]], {original_code: {'closeTagSpan': '</span>', 'interpolation': '{{ valueA | pipeA }}', 'interpolation_1': '{{ valueB | pipeB }}', 'interpolation_2': '{{ valueC | pipeC }}', 'startTagSpan': '<span>'}}, {})
  …
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵpipe(2, "pipeA");
    $r3$.ɵɵpipe(3, "pipeB");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(4, "div");
    $r3$.ɵɵi18nStart(5, 1);
    $r3$.ɵɵelement(6, "span");
    $r3$.ɵɵpipe(7, "pipeA");
    $r3$.ɵɵpipe(8, "pipeB");
    $r3$.ɵɵelement(9, "span");
    $r3$.ɵɵpipe(10, "pipeC");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(3);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, …, ctx.valueA))($r3$.ɵɵpipeBind1(3, …, ctx.valueB));
    $r3$.ɵɵi18nApply(1);
    $r3$.ɵɵadvance(7);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(7, …, ctx.valueA))($r3$.ɵɵpipeBind1(8, …, ctx.valueB))($r3$.ɵɵpipeBind1(10, …, ctx.valueC));
    $r3$.ɵɵi18nApply(5);
  }
}
