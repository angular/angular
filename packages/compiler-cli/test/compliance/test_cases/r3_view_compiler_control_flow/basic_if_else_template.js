function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " hello ");
  }
}

function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " goodbye ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 0)(3, MyApp_Conditional_3_Template, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(ctx.value() ? 2 : 3);
  }
}
