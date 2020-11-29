function MyComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 1);
  }
}
…
consts: function() {
  __i18nMsg__('My i18n block #2', [], {})
  __i18nMsg__('My i18n block #1', [], {})
  return [
    $i18n_0$,
    $i18n_1$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 0, "ng-template");
    $r3$.ɵɵelementContainerStart(1);
    $r3$.ɵɵi18n(2, 0);
    $r3$.ɵɵelementContainerEnd();
  }
}