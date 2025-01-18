function MyApp_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " case 0, 1, or 2 ");
  }
}

function MyApp_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " case 3 ");
  }
}

function MyApp_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " case 4 ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵtemplate(2, MyApp_Case_2_Template, 1, 0)(3, MyApp_Case_3_Template, 1, 0)(4, MyApp_Case_4_Template, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $MyApp_contFlowTmp$;
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(($MyApp_contFlowTmp$ = ctx.value()) === 0 ? 2 : $MyApp_contFlowTmp$ === 1 ? 2 : $MyApp_contFlowTmp$ === 2 ? 2 : $MyApp_contFlowTmp$ === 3 ? 3 : $MyApp_contFlowTmp$ === 4 ? 4 : -1);
  }
}
