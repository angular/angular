function TestComp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const $_r2$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵtext(0);
    $r3$.ɵɵdomElementStart(1, "button", 0);
    $r3$.ɵɵdomListener("click", function TestComp_Conditional_2_Template_button_click_1_listener() {
      $r3$.ɵɵrestoreView($_r2$);
      const $ctx_r2$ = $r3$.ɵɵnextContext();
      const $fn_r4$ = $r3$.ɵɵreadContextLet(0);
      return $r3$.ɵɵresetView($ctx_r2$.componentValue = $fn_r4$(2, 1));
    });
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $fn_r4$ = $r3$.ɵɵreadContextLet(0);
    $r3$.ɵɵtextInterpolate1(" Two: ", $fn_r4$(1, 1), " ");
  }
}
…
$r3$.ɵɵdefineComponent({
  …
  decls: 4,
  vars: 3,
  consts: [[3, "click"]],
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      const $_r1$ = $r3$.ɵɵgetCurrentView();
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵtext(1);
      $r3$.ɵɵconditionalCreate(2, TestComp_Conditional_2_Template, 2, 1);
      // NOTE: the restoreView and resetView calls here are the result of variable optimization not picking up some cases. We can remove them once #66286 is resolved.
      $r3$.ɵɵstoreCallback(3, (a, b) => {
        $r3$.ɵɵrestoreView($_r1$);
        return $r3$.ɵɵresetView(ctx.componentValue + a + b);
      });
    }
    if (rf & 2) {
      const $_callbackFn0_r5$ = $r3$.ɵɵgetCallback(3);
      const $fn_r6$ = $r3$.ɵɵstoreLet($_callbackFn0_r5$);
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" One: ", $fn_r6$(0, 1), " ");
      $r3$.ɵɵadvance();
      $r3$.ɵɵconditional(true ? 2 : -1);
    }
  },
  …
});
