const $_callbackFn0$ = a => b => c => d => a + b + c + d;
…
$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 1,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate($_callbackFn0$(1)(2)(3)(4));
    }
  },
  …
});
