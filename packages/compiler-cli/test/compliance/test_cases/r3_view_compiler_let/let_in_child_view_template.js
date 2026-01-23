function MyApp_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $two_0$ = $r3$.ɵɵreadContextLet(1);
    const $three_1$ = $two_0$ + 1;
    $r3$.ɵɵtextInterpolate1(" ", $three_1$, " ");
  }
}

…

function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, MyApp_Conditional_0_Conditional_0_Template, 1, 1);
    $r3$.ɵɵdeclareLet(1);
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $one_2$ = $r3$.ɵɵreadContextLet(1);
    $r3$.ɵɵconditional(true ? 0 : -1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵstoreLet($one_2$ + 1);
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 2,
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 2);
      $r3$.ɵɵdeclareLet(1);
    }
    if (rf & 2) {
      $r3$.ɵɵconditional(true ? 0 : -1);
      $r3$.ɵɵadvance();
      $r3$.ɵɵstoreLet(1);
    }
  },
  …
});
