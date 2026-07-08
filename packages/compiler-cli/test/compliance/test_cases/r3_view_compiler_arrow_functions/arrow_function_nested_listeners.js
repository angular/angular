function TestComp_Conditional_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    const $_r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵdomElementStart(1, "button", 1);
    $r3$.ɵɵdomListener("click", function TestComp_Conditional_1_Conditional_2_Template_button_click_1_listener() {
      $r3$.ɵɵrestoreView($_r1$);
      const $c_r2$ = $r3$.ɵɵreadContextLet(0);
      $r3$.ɵɵnextContext();
      const $b_r3$ = $r3$.ɵɵreference(1);
      const $ctx_r3$ = $r3$.ɵɵnextContext();
      const $a_r5$ = $r3$.ɵɵreadContextLet(0);
      return $r3$.ɵɵresetView($ctx_r3$.someSignal(prev => prev + $a_r5$ + $b_r3$.value + $c_r2$ + $ctx_r3$.componentProp));
    });
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵstoreLet(3);
  }
}
function TestComp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElement(0, "input", null, 0);
    $r3$.ɵɵconditionalCreate(2, TestComp_Conditional_1_Conditional_2_Template, 2, 1, "button");
    (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(2, "if", 1, null, "true", ["true"]);
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵconditional(true ? 2 : -1);
  }
}
…
$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 2,
  consts: [["b", ""], [3, "click"]],
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵconditionalCreate(1, TestComp_Conditional_1_Template, 3, 1);
      (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(1, "if", 1, null, "true", ["true"]);
    }
    if (rf & 2) {
      $r3$.ɵɵstoreLet(1);
      $r3$.ɵɵadvance();
      $r3$.ɵɵconditional(true ? 1 : -1);
    }
  },
  …
});
