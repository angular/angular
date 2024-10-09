$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 1,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵtext(1);
    }
    if (rf & 2) {
      const $result_0$ = ctx.value * 2;
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" The result is ", $result_0$, " ");
    }
  },
  …
});
