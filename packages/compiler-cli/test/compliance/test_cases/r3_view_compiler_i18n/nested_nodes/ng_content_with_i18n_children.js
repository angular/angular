const $_c0$ = ["*"];

function MyComponent_ProjectionFallback_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "span");
    $r3$.ɵɵi18nStart(1, 0);
    $r3$.ɵɵdomElement(2, "b");
    $r3$.ɵɵi18nEnd();
    $r3$.ɵɵdomElementEnd();
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  ngContentSelectors: $_c0$,
  decls: 2,
  vars: 0,
  consts: () => {
    __i18nMsg__('a {$startBoldText}b{$closeBoldText} c', [['closeBoldText', String.raw`\uFFFD/#2\uFFFD`], ['startBoldText', String.raw`\uFFFD#2\uFFFD`]], {original_code: {"closeBoldText": "</b>", "startBoldText": "<b>"}}, {id: 'MY_ID'})
    return [$i18n_0$];
  },
  template: function MyComponent_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵprojectionDef();
      $r3$.ɵɵprojection(0, 0, null, MyComponent_ProjectionFallback_0_Template, 3, 0);
    }
  },
  …
});
