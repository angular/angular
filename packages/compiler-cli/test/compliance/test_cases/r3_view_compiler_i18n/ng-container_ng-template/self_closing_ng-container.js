decls: 3,
vars: 0,
consts: function() {
  __i18nMsg__(' Hello {$startTagNgContainer}there{$closeTagNgContainer}', [['startTagNgContainer', String.raw`\uFFFD#2\uFFFD`], ['closeTagNgContainer', String.raw`\uFFFD/#2\uFFFD`]], {original_code: {'startTagNgContainer': '<ng-container>', 'closeTagNgContainer': '</ng-container>'}}, {})
  return [
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵelementContainer(2);
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
}
