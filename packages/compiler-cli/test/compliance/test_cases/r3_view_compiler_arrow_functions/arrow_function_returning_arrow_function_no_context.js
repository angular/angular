const $arrowFn0$ = (ctx, view) => a => b => c => d => a + b + c + d;
…
$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 2,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate($r3$.ɵɵarrowFunction(1, $arrowFn0$, ctx)(1)(2)(3)(4));
    }
  },
  …
});
