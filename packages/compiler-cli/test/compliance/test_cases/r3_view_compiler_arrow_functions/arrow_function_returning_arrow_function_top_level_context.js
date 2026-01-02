$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 1,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵstoreCallback(1, a => b => c => d => a + b + c + d + ctx.componentProp);
    }
    if (rf & 2) {
      const $_callbackFn0_r1$ = $r3$.ɵɵgetCallback(1);
      $r3$.ɵɵtextInterpolate($_callbackFn0_r1$(1)(2)(3)(4));
    }
  },
  …
});
