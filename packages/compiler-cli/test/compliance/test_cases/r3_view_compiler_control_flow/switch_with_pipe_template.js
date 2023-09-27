function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵpipe(2, "test");
    $r3$.ɵɵtemplate(3, MyApp_Case_3_Template, 1, 0)(4, MyApp_Case_4_Template, 1, 0)(5, MyApp_Case_5_Template, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $MyApp_contFlowTmp$;
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵconditional(3, ($MyApp_contFlowTmp$ = $r3$.ɵɵpipeBind1(2, 2, ctx.value())) === 0 ? 3 : $MyApp_contFlowTmp$ === 1 ? 4 : 5);
  }
}
