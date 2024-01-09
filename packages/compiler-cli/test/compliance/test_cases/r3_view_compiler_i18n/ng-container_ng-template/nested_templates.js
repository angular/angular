function MyComponent_ng_template_2_ng_template_2_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 0, 3);
  }
  if (rf & 2) {
    const $ctx_r2$ = $r3$.ɵɵnextContext(3);
    $r3$.ɵɵi18nExp($ctx_r2$.valueC);
    $r3$.ɵɵi18nApply(0);
  }
}
function MyComponent_ng_template_2_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 2);
    $r3$.ɵɵtemplate(1, MyComponent_ng_template_2_ng_template_2_ng_template_1_Template, 1, 1, "ng-template");
    $r3$.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const $ctx_r1$ = $r3$.ɵɵnextContext(2);
    $r3$.ɵɵadvance();
    $r3$.ɵɵi18nExp($ctx_r1$.valueB);
    $r3$.ɵɵi18nApply(0);
  }
}
…
function MyComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18nStart(0, 0, 1);
    $r3$.ɵɵpipe(1, "uppercase");
    $r3$.ɵɵtemplate(2, MyComponent_ng_template_2_ng_template_2_Template, 2, 1, "ng-template");
    $r3$.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 1, $ctx_r0$.valueA));
    $r3$.ɵɵi18nApply(0);
  }
}
…
decls: 3,
vars: 0,
consts: () => {
  __i18nMsgWithPostprocess__('{$startTagNgTemplate} Template A: {$interpolation} {$startTagNgTemplate} Template B: {$interpolation_1} {$startTagNgTemplate} Template C: {$interpolation_2} {$closeTagNgTemplate}{$closeTagNgTemplate}{$closeTagNgTemplate}', [['closeTagNgTemplate', String.raw`[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]`], ['interpolation', String.raw`\uFFFD0:1\uFFFD`], ['interpolation_1', String.raw`\uFFFD0:2\uFFFD`], ['interpolation_2', String.raw`\uFFFD0:3\uFFFD`], ['startTagNgTemplate', String.raw`[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]`]], {original_code: {'closeTagNgTemplate': '</ng-template>', 'interpolation': '{{ valueA | uppercase }}', 'interpolation_1': '{{ valueB }}', 'interpolation_2': '{{ valueC }}', 'startTagNgTemplate': '<ng-template>'}}, {}, [])
  return [
    $i18n_0$
  ];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 3, 3, "ng-template");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵelementEnd();
  }
}
