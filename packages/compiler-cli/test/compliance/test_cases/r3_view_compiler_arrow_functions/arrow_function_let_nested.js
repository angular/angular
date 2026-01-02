function TestComp_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const $_r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵtext(1);
    $r3$.ɵɵstoreCallback(2, () => {
      $r3$.ɵɵrestoreView($_r1$);
      const $c_r2$ = $r3$.ɵɵreadContextLet(0);
      $r3$.ɵɵnextContext();
      const $b_r3$ = $r3$.ɵɵreadContextLet(0);
      $r3$.ɵɵnextContext();
      const $a_r4$ = $r3$.ɵɵreadContextLet(0);
      return $r3$.ɵɵresetView($a_r4$ + $b_r3$ + $c_r2$);
    });
  }

  if (rf & 2) {
    const $_callbackFn0_r5$ = $r3$.ɵɵgetCallback(2);
    $r3$.ɵɵstoreLet(3);
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", $_callbackFn0_r5$(), " ");
  }
}
…
function TestComp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵconditionalCreate(1, TestComp_Conditional_1_Conditional_1_Template, 3, 2);
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
