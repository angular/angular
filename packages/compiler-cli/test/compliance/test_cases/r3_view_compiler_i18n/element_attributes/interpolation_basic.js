decls: 5,
vars: 8,
consts: function() {
  __i18nMsg__('static text', [], {}, {})
  __i18nMsg__('intro {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ valueA | uppercase }}'}}, {meaning: 'm', desc: 'd'})
  __i18nMsg__('{$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ valueB }}'}}, {meaning: 'm1', desc: 'd1'})
  __i18nMsg__('{$interpolation} and {$interpolation_1} and again {$interpolation_2}', [['interpolation', String.raw`\uFFFD0\uFFFD`],['interpolation_1', String.raw`\uFFFD1\uFFFD`],['interpolation_2', String.raw`\uFFFD2\uFFFD`]], {original_code: {'interpolation': '{{ valueA }}', 'interpolation_1': '{{ valueB }}', 'interpolation_2': '{{ valueA + valueB }}'}}, {meaning: 'm2', desc: 'd2'})
  __i18nMsg__('{$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ valueC }}'}}, {})
return [
    ["id", "dynamic-1", "aria-roledescription",  $i18n_0$, __AttributeMarker.I18n__,
      "title", "aria-label"],
    ["title", $i18n_1$, "aria-label", $i18n_2$],
    ["id", "dynamic-2", __AttributeMarker.I18n__, "title", "aria-roledescription"],
    ["title", $i18n_3$, "aria-roledescription", $i18n_4$]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 0);
    $r3$.ɵɵpipe(1, "uppercase");
    $r3$.ɵɵi18nAttributes(2, 1);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(3, "div", 2);
    $r3$.ɵɵi18nAttributes(4, 3);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 6, ctx.valueA))(ctx.valueB);
    $r3$.ɵɵi18nApply(2);
    $r3$.ɵɵadvance(3);
    $r3$.ɵɵi18nExp(ctx.valueA)(ctx.valueB)(ctx.valueA + ctx.valueB)(ctx.valueC);
    $r3$.ɵɵi18nApply(4);
  }
}