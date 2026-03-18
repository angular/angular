const $arrowFn0$ = (ctx, view) => param => param + ctx.value + 1;
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
      $r3$.ɵɵtextInterpolate($r3$.ɵɵarrowFunction(1, $arrowFn0$, ctx)("param"));
    }
  },
  …
});
