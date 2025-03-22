$r3$.ɵɵdefineComponent({
  …
  decls: 1,
  vars: 1,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
    }
    if (rf & 2) {
      const $one_0$ = ctx.value + 1;
      const $two_1$ = $one_0$ + 1;
      const $result_2$ = $two_1$ + 1;
      $r3$.ɵɵtextInterpolate1(" The result is ", $result_2$, " ");
    }
  },
  …
});
