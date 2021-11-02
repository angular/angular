function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 1);
    $r3$.ɵɵelement(2, "span");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp($ctx_r0$.valueA);
    $r3$.ɵɵi18nApply(1);
  }
}
…
decls: 1,
vars: 1,
consts: function() {
  __i18nMsg__('Some other content {$startTagSpan}{$interpolation}{$closeTagSpan}', [['startTagSpan', String.raw`\uFFFD#2\uFFFD`], ['interpolation', String.raw`\uFFFD0\uFFFD`], ['closeTagSpan', String.raw`\uFFFD/#2\uFFFD`]], {})
  return [
    [__AttributeMarker.Template__, "ngIf"],
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 1, "div", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngIf", ctx.visible);
  }
}