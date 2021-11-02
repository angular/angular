consts: function() {
  __i18nMsg__('Element title', [], {meaning: 'm', desc: 'd'})
  __i18nMsg__('Some content', [], {})
  return [
    ["title", $i18n_0$],
    $i18n_1$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 0);
    $r3$.ɵɵi18n(1, 1);
    $r3$.ɵɵelementEnd();
  }
}