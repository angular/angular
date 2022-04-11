function MyComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵi18n(0, 0);
    $r3$.ɵɵpipe(1, "uppercase");
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵi18nExp($r3$.ɵɵpipeBind1(1, 1, $ctx_r0$.valueA));
    $r3$.ɵɵi18nApply(0);
  }
}
…
decls: 1, vars: 0, consts: function() {
  __i18nMsg__('Some content: {$interpolation}', [['interpolation', String.raw`\uFFFD0\uFFFD`]], {original_code: {'interpolation': '{{ valueA | uppercase }}'}}, {})
  return [$i18n_0$];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 2, 3, "ng-template");
  }
}
