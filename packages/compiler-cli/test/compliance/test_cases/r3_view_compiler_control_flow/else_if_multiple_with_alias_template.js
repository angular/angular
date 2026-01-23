function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" One: ", ctx, " ");
  }
}

function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate1(" Two: ", ctx_r0.two, " ");
  }
}

function MyApp_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" Three: ", ctx, " ");
  }
}

function MyApp_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" Four: ", ctx, " ");
  }
}

function MyApp_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate1(" Five: ", ctx_r0.five, " ");
  }
}

…

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 1)(3, MyApp_Conditional_3_Template, 1, 1)(4, MyApp_Conditional_4_Template, 1, 1)(5, MyApp_Conditional_5_Template, 1, 1)(6, MyApp_Conditional_6_Template, 1, 1);
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    let $tmp_1_0$;
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(($tmp_1_0$ = ctx.one) ? 2 : ctx.two ? 3 : ($tmp_1_0$ = ctx.three) ? 4 : ($tmp_1_0$ = ctx.four) ? 5 : ctx.five ? 6 : -1, $tmp_1_0$);
  }
}
