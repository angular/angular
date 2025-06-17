function MyComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 0, 1);
  }
}
function MyComponent_ng_template_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 1, 1);
  }
}
…
decls: 6,
vars: 0,
consts: () => {
  __i18nMsg__('{$startTagNgTemplate}Content A{$closeTagNgTemplate}', [['closeTagNgTemplate', String.raw`\uFFFD/*2:1\uFFFD`], ['startTagNgTemplate', String.raw`\uFFFD*2:1\uFFFD`]], {original_code: { 'closeTagNgTemplate': '</ng-template>', 'startTagNgTemplate': '<ng-template>' }}, {})
  __i18nMsg__('{$startTagNgTemplate}Content B{$closeTagNgTemplate}', [['closeTagNgTemplate', String.raw`\uFFFD/*5:1\uFFFD`], ['startTagNgTemplate', String.raw`\uFFFD*5:1\uFFFD`]], {original_code: { 'closeTagNgTemplate': '</ng-template>', 'startTagNgTemplate': '<ng-template>' }}, {})
  return [$i18n_0$, $i18n_1$]; 
}, 
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵdomTemplate(2, MyComponent_ng_template_2_Template, 1, 0, "ng-template");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵdomElementEnd();
    $r3$.ɵɵdomElementStart(3, "div");
    $r3$.ɵɵi18nStart(4, 1);
    $r3$.ɵɵdomTemplate(5, MyComponent_ng_template_5_Template, 1, 0, "ng-template");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵdomElementEnd();
  }
}
