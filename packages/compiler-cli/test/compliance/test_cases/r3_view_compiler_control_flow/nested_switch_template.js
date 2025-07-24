function MyApp_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " case 0 ");
  }
}

function MyApp_Case_3_Case_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " nested case 0 ");
  }
}

function MyApp_Case_3_Case_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " nested case 1 ");
  }
}

function MyApp_Case_3_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " nested case 2 ");
  }
}

function MyApp_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, MyApp_Case_3_Case_0_Template, 1, 0)(1, MyApp_Case_3_Case_1_Template, 1, 0)(2, MyApp_Case_3_Case_2_Template, 1, 0);
  }
  if (rf & 2) {
    …
    const $ctx_r1$ = $r3$.ɵɵnextContext();
    …
    $r3$.ɵɵconditional(($MyApp_Case_3_contFlowTmp$ = $ctx_r1$.nestedValue()) === 0 ? 0 : $MyApp_Case_3_contFlowTmp$ === 1 ? 1 : $MyApp_Case_3_contFlowTmp$ === 2 ? 2 : -1);
  }
}

function MyApp_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " case 2 ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 1, 0)(3, MyApp_Case_3_Template, 3, 1)(4, MyApp_Case_4_Template, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $MyApp_contFlowTmp$;
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(($MyApp_contFlowTmp$ = ctx.value()) === 0 ? 2 : $MyApp_contFlowTmp$ === 1 ? 3 : $MyApp_contFlowTmp$ === 2 ? 4 : -1);
  }
}
