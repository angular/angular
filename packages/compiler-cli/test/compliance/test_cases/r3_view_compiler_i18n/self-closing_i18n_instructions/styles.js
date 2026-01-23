decls: 4,
vars: 0,
consts: () => {
  __i18nMsg__('Text #1', [], {}, {})
  __i18nMsg__('Text #2', [], {}, {})
  return [
    $i18n_0$,
    $i18n_1$,
    [__AttributeMarker.Classes__, "myClass"],
    [__AttributeMarker.Styles__, "padding", "10px"]
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "span", 2);
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(2, "span", 3);
    $r3$.ɵɵi18n(3, 1);
    $r3$.ɵɵelementEnd();
  }
}
