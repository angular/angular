function MyApp_Conditional_0_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $inner_r3$ = $r3$.ɵɵnextContext();
    const $root_r1$ = $r3$.ɵɵnextContext();
    const $ctx_r4$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate4(" Innermost: ", $ctx_r4$.value(), "/", $root_r1$, "/", $inner_r3$, "/", ctx, " ");
  }
}

function MyApp_Conditional_0_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵconditionalCreate(1, MyApp_Conditional_0_Conditional_1_Conditional_1_Template, 1, 4);
  }
  if (rf & 2) {
    // NOTE: TODO: These ellipses were added because of a different variable order between
    // NOTE: TemplateDefinitionBuilder and Template Pipeline. They should be removed once
    // NOTE: TemplateDefinitionBuilder is deleted. Other tests in this directory are also affected.
    …
    const $root_r1$ = $r3$.ɵɵnextContext();
    const $ctx_r2$ = $r3$.ɵɵnextContext();
    …
    $r3$.ɵɵtextInterpolate3(" Inner: ", $ctx_r2$.value(), "/", $root_r1$, "/", ctx, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(($MyApp_Conditional_0_Conditional_1_contFlowTmp$ = $ctx_r2$.value()) ? 1 : -1, $MyApp_Conditional_0_Conditional_1_contFlowTmp$);
  }
}

function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵconditionalCreate(1, MyApp_Conditional_0_Conditional_1_Template, 2, 4);
  }
  if (rf & 2) {
    …
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    …
    $r3$.ɵɵtextInterpolate2(" Root: ", $ctx_r0$.value(), "/", ctx, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(($MyApp_Conditional_0_contFlowTmp$ = $ctx_r0$.value()) ? 1 : -1, $MyApp_Conditional_0_contFlowTmp$);
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 3);
  }
  if (rf & 2) {
    let $MyApp_contFlowTmp$;
    $r3$.ɵɵconditional(($MyApp_contFlowTmp$ = ctx.value()) ? 0 : -1, $MyApp_contFlowTmp$);
  }
}
