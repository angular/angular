$r3$.ɵɵdefineComponent({
  …
  decls: 3,
  vars: 3,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵpipe(1, "double");
      $r3$.ɵɵtext(2);
    }
    if (rf & 2) {
      const $foo_r1$ = $r3$.ɵɵpipeBind1(1, 1, ctx.value) + 3;
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", $foo_r1$, " ");
    }
  },
  …
});
