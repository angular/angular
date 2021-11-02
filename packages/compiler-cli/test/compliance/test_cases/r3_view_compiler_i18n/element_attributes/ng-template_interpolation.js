consts: function() {
  __i18nMsg__('Hello {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {})
  return [
     [__AttributeMarker.Bindings__, "title"],
    ["title", $i18n_0$]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
    $r3$.ɵɵi18nAttributes(1, 1);
  }
  if (rf & 2) {
    $r3$.ɵɵi18nExp(ctx.name);
    $r3$.ɵɵi18nApply(1);
  }
}
