function MyApp_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $three_0$ = $r3$.ɵɵreadContextLet(3);
    $r3$.ɵɵtextInterpolate1(" ", $three_0$, " ");
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 7,
  vars: 4,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵtext(0);
      $r3$.ɵɵdeclareLet(1)(2)(3)(4);
      $r3$.ɵɵtext(5);
      $r3$.ɵɵtemplate(6, MyApp_Conditional_6_Template, 1, 1);
    }
    if (rf & 2) {
      $r3$.ɵɵtextInterpolate1(" ", ctx.value, " ");
      const $one_1$ = ctx.value + 1;
      const $two_2$ = $one_1$ + 1;
      $r3$.ɵɵadvance(3);
      const $three_3$ = i0.ɵɵstoreLet($two_2$ + 1);
      $three_3$ + 1;
      $r3$.ɵɵadvance(2);
      $r3$.ɵɵtextInterpolate1(" ", ctx.value, " ");
      $r3$.ɵɵadvance();
      $r3$.ɵɵconditional(true ? 6 : -1);
    }
  },
  …
});
