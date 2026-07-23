function MyComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 0, 1);
    $r3$.ɵɵpipe(1, "uppercase");
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance();
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 1, $ctx_r0$.valueA));
    $r3$.ɵɵi18nApply(0);
  }
}
…
decls: 5,
vars: 3,
consts: () => {
  __i18nMsg__('{$startTagNgTemplate}Template content: {$interpolation}{$closeTagNgTemplate}{$startTagNgContainer}Container content: {$interpolation_1}{$closeTagNgContainer}', [['closeTagNgContainer', String.raw`\uFFFD/#3\uFFFD`], ['closeTagNgTemplate', String.raw`\uFFFD/*2:1\uFFFD`], ['interpolation', String.raw`\uFFFD0:1\uFFFD`], ['interpolation_1', String.raw`\uFFFD0\uFFFD`], ['startTagNgContainer', String.raw`\uFFFD#3\uFFFD`], ['startTagNgTemplate', String.raw`\uFFFD*2:1\uFFFD`]], {original_code: {'closeTagNgContainer': '</ng-container>', 'closeTagNgTemplate': '</ng-template>', 'interpolation': '{{ valueA | uppercase }}', 'interpolation_1': '{{ valueB | uppercase }}', 'startTagNgContainer': '<ng-container>', 'startTagNgTemplate': '<ng-template>',}}, {})
  return [
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 2, 3, "ng-template");
    $r3$.ɵɵelementContainer(3);
    $r3$.ɵɵpipe(4, "uppercase");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(4);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(4, 1, ctx.valueB));
    $r3$.ɵɵi18nApply(1);
  }
}
