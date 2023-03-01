decls: 4,
vars: 0,
consts: function() {
  __i18nMsg__('Text #1', [], {}, {})
  __i18nMsg__('Text #2', [], {}, {})
  return [
    [__AttributeMarker.Classes__, "myClass"],
    $i18n_0$,
    [__AttributeMarker.Styles__, "padding", "10px"],
    $i18n_1$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "span", 0);
    $r3$.ɵɵi18n(1, 1);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(2, "span", 2);
    $r3$.ɵɵi18n(3, 3);
    $r3$.ɵɵelementEnd();
  }
}
