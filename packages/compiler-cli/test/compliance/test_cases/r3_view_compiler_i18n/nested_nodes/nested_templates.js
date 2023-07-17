function MyComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div")(1, "div");
    $r3$.ɵɵi18nStart(2, 1);
    $r3$.ɵɵelement(3, "div");
    $r3$.ɵɵpipe(4, "uppercase");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(4);
    $r3$.ɵɵi18nExp($ctx_r0$.valueA)($r3$.ɵɵpipeBind1(4, 2, $ctx_r0$.valueB));
    $r3$.ɵɵi18nApply(2);
  }
}
…
decls: 3,
vars: 1,
consts: function() {
  __i18nMsg__(' Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$closeTagDiv}', [['interpolation', String.raw`\uFFFD0\uFFFD`], ['startTagDiv', String.raw`\uFFFD#3\uFFFD`], ['interpolation_1', String.raw`\uFFFD1\uFFFD`], ['closeTagDiv', String.raw`\uFFFD/#3\uFFFD`]], {original_code: {'interpolation': '{{ valueA }}', 'startTagDiv': '<div>', 'interpolation_1': '{{ valueB | uppercase }}', 'closeTagDiv': '</div>'}}, {})
  return [
    [__AttributeMarker.Template__, "ngIf"],
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1, " Some content ");
    $r3$.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 4, "div", 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵproperty("ngIf", ctx.visible);
  }
}