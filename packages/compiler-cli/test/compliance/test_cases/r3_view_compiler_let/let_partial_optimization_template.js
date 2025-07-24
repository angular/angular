$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 2,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵtext(1);
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate1(" ", ctx.value, " ");
      const $one_0$ = ctx.value + 1;
      const $two_1$ = $one_0$ + 1;
      const $three_2$ = $two_1$ + 1;
      $three_2$ + 1;
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" ", $two_1$, " ");
    }
  },
  …
});
