function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate1(" ", $ctx_r0$.one, " ");
  }
}
function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtextInterpolate2(" ", $ctx_r0$.value(), " as ", ctx, " ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomElementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 1)(3, MyApp_Conditional_3_Template, 1, 2);
    (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵɵconditionalMetadata(2, "if", 2, null, "one", ["one", "value()"]);
    $r3$.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    let $tmp_1_0$;
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(ctx.one ? 2 : ($tmp_1_0$ = ctx.value()) ? 3 : -1, $tmp_1_0$);
  }
}
