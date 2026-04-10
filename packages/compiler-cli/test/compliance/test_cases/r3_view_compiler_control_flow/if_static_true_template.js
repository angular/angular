function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "p");
    $r3$.ɵɵtext(1, "Hello");
    $r3$.ɵɵelementEnd();
  }
}

function MyApp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "p");
    $r3$.ɵɵtext(1, "world");
    $r3$.ɵɵelementEnd();
  }
}

function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 0)(1, MyApp_Conditional_1_Template, 2, 0);
  }
  if (rf & 2) {
    $r3$.ɵɵconditional(true ? 0 : 1);
  }
}
