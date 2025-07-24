function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " zero ");
  }
}

function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " one ");
  }
}

function MyApp_Conditional_4_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " inner zero ");
  }
}

function MyApp_Conditional_4_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " inner one ");
  }
}

function MyApp_Conditional_4_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " inner two ");
  }
}

function MyApp_Conditional_4_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " inner three ");
  }
}

function MyApp_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, MyApp_Conditional_4_Conditional_0_Template, 1, 0)(1, MyApp_Conditional_4_Conditional_1_Template, 1, 0)(2, MyApp_Conditional_4_Conditional_2_Template, 1, 0)(3, MyApp_Conditional_4_Conditional_3_Template, 1, 0);
  }
  if (rf & 2) {
    const $ctx_r2$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵconditional($ctx_r2$.innerVal === 0 ? 0 : $ctx_r2$.innerVal === 1 ? 1 : $ctx_r2$.innerVal === 2 ? 2 : 3);
  }
}

function MyApp_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " three ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 0)(3, MyApp_Conditional_3_Template, 1, 0)(4, MyApp_Conditional_4_Template, 4, 1)(5, MyApp_Conditional_5_Template, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(ctx.val === 0 ? 2 : ctx.val === 1 ? 3 : ctx.val === 2 ? 4 : 5);
  }
}
