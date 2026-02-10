const $_c0$ = a0 => [a0];
const $arrowFn0$ = (ctx, view) => a => a + 1;
const $arrowFn1$ = (ctx, view) => a => a + 1 + ctx.componentProp;
…
$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 8,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate2(" ",
        $r3$.ɵɵpureFunction1(4, $_c0$, $r3$.ɵɵarrowFunction(2, $arrowFn0$, ctx))[0](1000), " ",
        $r3$.ɵɵpureFunction1(6, $_c0$, $r3$.ɵɵarrowFunction(3, $arrowFn1$, ctx))[0](1000), " ");
    }
  },
  …
});
