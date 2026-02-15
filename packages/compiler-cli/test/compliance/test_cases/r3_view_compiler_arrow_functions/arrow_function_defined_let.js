const arrowFn0 = (ctx, view) => (a, b) => ctx.componentValue + a + b;
…
function TestComp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const $_r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵtext(0);
    $r3$.ɵɵdomElementStart(1, "button", 0);
    $r3$.ɵɵdomListener("click", function TestComp_Conditional_2_Template_button_click_1_listener() {
      $r3$.ɵɵrestoreView($_r1$);
      const $ctx_r1$ = $r3$.ɵɵnextContext();
      const $fn_r3$ = $r3$.ɵɵreadContextLet(0);
      return $r3$.ɵɵresetView($ctx_r1$.componentValue = $fn_r3$(2, 1));
    });
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $fn_r3$ = $r3$.ɵɵreadContextLet(0);
    $r3$.ɵɵtextInterpolate1(" Two: ", $fn_r3$(1, 1), " ");
  }
}
…
$r3$.ɵɵdefineComponent({
  …
  decls: 3,
  vars: 4,
  consts: [[3, "click"]],
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵtext(1);
      $r3$.ɵɵconditionalCreate(2, TestComp_Conditional_2_Template, 2, 1);
    }
    if (rf & 2) {
      const $fn_r6$ = $r3$.ɵɵstoreLet($r3$.ɵɵarrowFunction(2, $arrowFn0$, ctx));
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" One: ", $fn_r6$(0, 1), " ");
      $r3$.ɵɵadvance();
      $r3$.ɵɵconditional(true ? 2 : -1);
    }
  },
  …
});
