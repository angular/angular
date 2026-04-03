decls: 2,
vars: 1,
consts: () => {
  __i18nMsg__('{$interpolation} title', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{valueA.getRawValue()?.getTitle()}}'}}, {})
  return [
	["title", $i18n_0$],
    [__AttributeMarker.I18n__, "title"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 1);
    $r3$.ɵɵi18nAttributes(1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵi18nExp((ctx.valueA.getRawValue()?.getTitle)() ?? null);
    $r3$.ɵɵi18nApply(1);
  }
}
