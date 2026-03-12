function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " one ");
  }
}

function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " two ");
  }
}

function MyApp_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " three ");
  }
}

function MyApp_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " four ");
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 0)(3, MyApp_Conditional_3_Template, 1, 0)(4, MyApp_Conditional_4_Template, 1, 0)(5, MyApp_Conditional_5_Template, 1, 0);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance();
    $r3$.ɵɵconditional(ctx.value() === 1 ? 2 : ctx.otherValue() === 2 ? 3 : ctx.message ? 4 : 5);
  }
}
