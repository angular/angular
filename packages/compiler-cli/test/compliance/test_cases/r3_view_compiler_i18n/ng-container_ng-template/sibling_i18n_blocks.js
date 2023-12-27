function MyComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 1);
  }
}
function MyComponent_ng_template_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 1, 1);
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
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵi18nStart(1, 0);
    i0.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 1, 0, "ng-template");
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div");
    i0.ɵɵi18nStart(4, 1);
    i0.ɵɵtemplate(5, MyComponent_ng_template_5_Template, 1, 0, "ng-template");
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd();
  }
}
