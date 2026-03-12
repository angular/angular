function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " foo ");
  }
}
function MyApp_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " foo ");
  }
}
function MyApp_Conditional_1_Conditional_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " foo ");
  }
}
function MyApp_Conditional_1_Conditional_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $inner_r1$ = $r3$.ɵɵnextContext();
    const $root_r2$ = $r3$.ɵɵnextContext();
    const $ctx_r2$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate4(" Innermost: ", $ctx_r2$.value(), "/", $root_r2$, "/", $inner_r1$, "/", ctx, " ");
  }
}
function MyApp_Conditional_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵconditionalCreate(1, MyApp_Conditional_1_Conditional_2_Conditional_1_Template, 1, 0)(2, MyApp_Conditional_1_Conditional_2_Conditional_2_Template, 1, 4);
  }
  if (rf & 2) {
    let $tmp_5_0$;
    const $root_r2$ = $r3$.ɵɵnextContext();
    const $ctx_r2$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate3(" Inner: ", $ctx_r2$.value(), "/", $root_r2$, "/", ctx, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional($ctx_r2$.foo ? 1 : ($tmp_5_0$ = $ctx_r2$.value()) ? 2 : -1, $tmp_5_0$);
  }
}
function MyApp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵconditionalCreate(1, MyApp_Conditional_1_Conditional_1_Template, 1, 0)(2, MyApp_Conditional_1_Conditional_2_Template, 3, 4);
  }
  if (rf & 2) {
    let $tmp_3_0$;
    const $ctx_r2$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate2(" Root: ", $ctx_r2$.value(), "/", ctx, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional($ctx_r2$.foo ? 1 : ($tmp_3_0$ = $ctx_r2$.value()) ? 2 : -1, $tmp_3_0$);
  }
}

…

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 1, 0)(1, MyApp_Conditional_1_Template, 3, 3);
  }
  if (rf & 2) {
    let $tmp_0_0$;
    $r3$.ɵɵconditional(ctx.foo ? 0 : ($tmp_0_0$ = ctx.value()) ? 1 : -1, $tmp_0_0$);
  }
}
