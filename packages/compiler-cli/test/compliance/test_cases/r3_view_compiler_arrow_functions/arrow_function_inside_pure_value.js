const $_c0$ = a0 => [a0];
const $_callbackFn0$ = a => a + 1;
…
$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 6,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵstoreCallback(1, a => a + 1 + ctx.componentProp);
    }
    if (rf & 2) {
      const $_callbackFn1_r1$ = $r3$.ɵɵgetCallback(1);
      $r3$.ɵɵtextInterpolate2(" ", $r3$.ɵɵpureFunction1(2, $_c0$, $_callbackFn0$)[0](1000), " ",
        $r3$.ɵɵpureFunction1(4, $_c0$, $_callbackFn1_r1$)[0](1000), " ");
    }
  },
  …
});
