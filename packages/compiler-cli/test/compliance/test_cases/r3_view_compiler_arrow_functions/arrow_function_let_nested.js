const $arrowFn0$ = (ctx, view) => () => {
  $r3$.ɵɵrestoreView(view);
  const $c_r1$ = $r3$.ɵɵreadContextLet(0);
  $r3$.ɵɵnextContext();
  const $b_r2$ = $r3$.ɵɵreadContextLet(0);
  $r3$.ɵɵnextContext();
  const $a_r3$ = $r3$.ɵɵreadContextLet(0);
  return $r3$.ɵɵresetView($a_r3$ + $b_r2$ + $c_r1$);
};
…
function TestComp_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵtext(1);
  }
  if (rf & 2) {
    $r3$.ɵɵstoreLet(3);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵarrowFunction(2, $arrowFn0$, ctx)(), " ");
  }
}
…
function TestComp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵconditionalCreate(1, TestComp_Conditional_1_Conditional_1_Template, 2, 3);
  }
  if (rf & 2) {
    $r3$.ɵɵstoreLet(2);
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(true ? 1 : -1);
  }
}
…
$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 2,
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵconditionalCreate(1, TestComp_Conditional_1_Template, 2, 2);
    }
    if (rf & 2) {
      $r3$.ɵɵstoreLet(1);
      $r3$.ɵɵadvance();
      $r3$.ɵɵconditional(true ? 1 : -1);
    }
  },
  …
});
