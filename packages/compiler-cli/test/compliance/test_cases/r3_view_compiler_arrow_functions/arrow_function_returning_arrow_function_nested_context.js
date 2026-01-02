function TestComp_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const $_r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵtext(0);
    $r3$.ɵɵstoreCallback(1, a => {
      $r3$.ɵɵrestoreView($_r1$);
      $r3$.ɵɵnextContext();
      const $nestedLet_r2$ = $r3$.ɵɵreadContextLet(0);
      const $ctx_r2$ = $r3$.ɵɵnextContext();
      const $topLevelLet_r4$ = $r3$.ɵɵreadContextLet(0);
      return $r3$.ɵɵresetView(b => c => d => a + b + c + d + $ctx_r2$.componentProp + $topLevelLet_r4$ + $nestedLet_r2$);
    });
  }
  if (rf & 2) {
    const $_callbackFn0_r5$ = $r3$.ɵɵgetCallback(1);
    $r3$.ɵɵtextInterpolate1(" ", $_callbackFn0_r5$(1)(2)(3)(4), " ");
  }
}
…
function TestComp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵconditionalCreate(1, TestComp_Conditional_1_Conditional_1_Template, 2, 1);
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
