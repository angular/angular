decls: 2,
vars: 1,
consts: function() {
  __i18nMsg__('{$interpolation} title', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {})
  return [
    [__AttributeMarker.I18n__, "title"],
    ["title", $i18n_0$]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 0);
    $r3$.ɵɵi18nAttributes(1, 1);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $tmp_0_0$ = null;
    $r3$.ɵɵi18nExp(($tmp_0_0$ = ctx.valueA.getRawValue()) == null ? null : $tmp_0_0$.getTitle());
    $r3$.ɵɵi18nApply(1);
  }
}
