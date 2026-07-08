function MyApp_ng_template_1_Conditional_1_Case_1_Template(rf, ctx) {
  if (rf & 1) {
    const $_r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵdomElementStart(1, "button", 0);
    $r3$.ɵɵdomListener(
      "click",
      function MyApp_ng_template_1_Conditional_1_Case_1_Template_button_click_1_listener() {
        $r3$.ɵɵrestoreView($_r1$);
        const $four_1$ = $r3$.ɵɵreadContextLet(0);
        $r3$.ɵɵnextContext();
        const $three_2$ = $r3$.ɵɵreadContextLet(0);
        $r3$.ɵɵnextContext();
        const $two_3$ = $r3$.ɵɵreadContextLet(0);
        const $ctx_r4$ = $r3$.ɵɵnextContext();
        const $one_5$ = $r3$.ɵɵreadContextLet(0);
        return $r3$.ɵɵresetView($ctx_r4$.callback($one_5$, $two_3$, $three_2$, $four_1$));
      }
    );
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $three_2$ = $r3$.ɵɵreadContextLet(0);
    $r3$.ɵɵstoreLet($three_2$ + 1);
  }
}

…

function MyApp_ng_template_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵconditionalCreate(1, MyApp_ng_template_1_Conditional_1_Case_1_Template, 2, 1, "button");
    (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(1, "switch", 1, null, "1", [["1"]]);
  }
  if (rf & 2) {
    let $tmp_5_0$;
    $r3$.ɵɵnextContext();
    const $two_3$ = $r3$.ɵɵreadContextLet(0);
    $r3$.ɵɵstoreLet($two_3$ + 1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(($tmp_5_0$ = 1) === 1 ? 1 : -1);
  }
}

…

function MyApp_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdeclareLet(0);
    $r3$.ɵɵconditionalCreate(1, MyApp_ng_template_1_Conditional_1_Template, 2, 2);
    (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(1, "if", 1, null, "true", ["true"]);
  }
  if (rf & 2) {
    $r3$.ɵɵnextContext();
    const $one_5$ = $r3$.ɵɵreadContextLet(0);
    $r3$.ɵɵstoreLet($one_5$ + 1);
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(true ? 1 : -1);
  }
}

…

$r3$.ɵɵdefineComponent({
  …
  decls: 2,
  vars: 1,
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdeclareLet(0);
      $r3$.ɵɵdomTemplate(1, MyApp_ng_template_1_Template, 2, 2, "ng-template");
    }
    if (rf & 2) {
      $r3$.ɵɵstoreLet(ctx.value + 1);
    }
  },
  …
});
