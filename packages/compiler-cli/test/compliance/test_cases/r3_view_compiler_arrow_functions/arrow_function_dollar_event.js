function TestComp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const $_r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵdomElementStart(1, "button", 0);
    $r3$.ɵɵdomListener(
      "click",
      function TestComp_Conditional_1_Template_button_click_1_listener($event) {
        $r3$.ɵɵrestoreView($_r1$);
        const $innerLet_r2$ = $r3$.ɵɵreadContextLet(0);
        const $ctx_r2$ = $r3$.ɵɵnextContext();
        const $topLevelLet_r4$ = $r3$.ɵɵreadContextLet(0);
        return $r3$.ɵɵresetView($ctx_r2$.signal.update(prev => $event.type + prev + $innerLet_r2$ + $topLevelLet_r4$ + $ctx_r2$.componentProp));
    });
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵstoreLet(2);
  }
}
…
$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 2,
  consts: [[3, "click"]],
  template: function TestComp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵconditionalCreate(1, TestComp_Conditional_1_Template, 2, 1, "button");
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
