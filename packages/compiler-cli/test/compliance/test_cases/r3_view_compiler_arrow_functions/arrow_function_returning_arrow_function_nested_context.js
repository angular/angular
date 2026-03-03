const $arrowFn0$ = (ctx, view) => a => {
  $r3$.ɵɵrestoreView(view);
  $r3$.ɵɵnextContext();
  const $nestedLet_r1$ = $r3$.ɵɵreadContextLet(0);
  const $ctx_r1$ = $r3$.ɵɵnextContext();
  const $topLevelLet_r3$ = $r3$.ɵɵreadContextLet(0);
  return $r3$.ɵɵresetView(b => c => d => a + b + c + d + $ctx_r1$.componentProp + $topLevelLet_r3$ + $nestedLet_r1$);
};
…
function TestComp_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", $r3$.ɵɵarrowFunction(1, $arrowFn0$, ctx)(1)(2)(3)(4), " ");
  }
}
…
function TestComp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵconditionalCreate(1, TestComp_Conditional_1_Conditional_1_Template, 1, 2);
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
