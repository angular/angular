function MyComponent_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 2);
    $r3$.ɵɵelement(1, "img", 1);
    $r3$.ɵɵi18nEnd();
  }
}
…
consts: function() {
  __i18nMsg__('{$tagImg} is my logo #1 ', [['tagImg', String.raw`\uFFFD#2\uFFFD\uFFFD/#2\uFFFD`]], {original_code: {tagImg: '<img src="logo.png" title="Logo" />'}}, {})
  __i18nMsg__('{$tagImg} is my logo #2 ', [['tagImg', String.raw`\uFFFD#1\uFFFD\uFFFD/#1\uFFFD`]], {original_code: {tagImg: '<img src="logo.png" title="Logo" />'}}, {})
  return [
    $i18n_0$,
    ["src", "logo.png", "title", "Logo"],
    $i18n_1$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementContainerStart(0);
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵelement(2, "img", 1);
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementContainerEnd();
    $r3$.ɵɵtemplate(3, MyComponent_ng_template_3_Template, 2, 0, "ng-template");
  }
}