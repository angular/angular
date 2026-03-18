function MyApp_Case_2_Template(rf, ctx)  {}

function MyApp_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " case 01 ");
  }
}

function MyApp_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " case 2 ");
  }
}

function MyApp_Case_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " default ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 0, 0)(3, MyApp_Case_3_Template, 1, 0)(4, MyApp_Case_4_Template, 1, 0)(5, MyApp_Case_5_Template, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
  let $MyApp_contFlowTmp$;
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional((tmp_1_0 = ctx.value()) === -1 ? 2 : tmp_1_0 === 0 ? 3 : tmp_1_0 === 1 ? 3 : tmp_1_0 === 2 ? 4 : 5);
  }
}
