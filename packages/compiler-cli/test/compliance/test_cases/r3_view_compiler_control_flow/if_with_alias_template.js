function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $ctx0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate2(" ", $ctx0$.value(), " as ", ctx, " ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 2);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $MyApp_contFlowTmp$;
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(($MyApp_contFlowTmp$ = ctx.value()) ? 2 : -1, $MyApp_contFlowTmp$);
  }
}
