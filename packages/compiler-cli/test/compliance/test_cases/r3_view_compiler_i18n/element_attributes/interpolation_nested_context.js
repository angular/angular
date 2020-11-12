function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵelementStart(1, "div", 1);
    $r3$.ɵɵpipe(2, "uppercase");
    $r3$.ɵɵi18nAttributes(3, 2);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $outer_r1$ = ctx.$implicit;
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(2, 1, $outer_r1$));
    $r3$.ɵɵi18nApply(3);
  }
}
…
decls: 1,
vars: 1,
consts: function() {
  __i18nMsg__('different scope {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {meaning: 'm', desc: 'd'})
  return [
    [__AttributeMarker.Template__, "ngFor", "ngForOf"],
    [__AttributeMarker.I18n__, "title"],
    ["title", $i18n_0$]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 3, "div", 0);
  }
  if (rf & 2) {
    $r3$.ɵɵproperty("ngForOf", ctx.items);
  }
}