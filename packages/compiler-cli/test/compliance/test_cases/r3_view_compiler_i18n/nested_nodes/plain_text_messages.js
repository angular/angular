consts: function() {
  __i18nMsg__('My i18n block #1', [], {}, {})
  __i18nMsg__('My i18n block #2', [], {}, {})
  __i18nMsg__('My i18n block #3', [], {}, {})
  return [
    $i18n_0$,
    $i18n_1$,
    $i18n_2$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18n(1, 0);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(2, "div");
    $r3$.ɵɵtext(3, "My non-i18n block #1");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(4, "div");
    $r3$.ɵɵi18n(5, 1);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(6, "div");
    $r3$.ɵɵtext(7, "My non-i18n block #2");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(8, "div");
    $r3$.ɵɵi18n(9, 2);
    $r3$.ɵɵelementEnd();
  }
}
