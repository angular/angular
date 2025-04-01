$r3$.ɵɵdefineComponent({
  …
  decls: 4,
  vars: 3,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0)(1);
      $r3$.ɵɵpipe(2, "double");
      $r3$.ɵɵtext(3);
    }
    if (rf & 2) {
      const $one_0$ = ctx.value + 1;
      const $result_1$ = $r3$.ɵɵpipeBind1(2, 1, $one_0$);
      $r3$.ɵɵadvance(3);
      $r3$.ɵɵtextInterpolate1(" The result is ", $result_1$, " ");
    }
  },
  …
});
