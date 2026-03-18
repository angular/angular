function TestComponent_Primary_1_Primary_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Inner Main ");
  }
}
function TestComponent_Primary_1_Error_3_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Inner Fallback ");
  }
}
function TestComponent_Primary_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Outer Main ");
    $r3$.ɵɵboundaryCreate(1);
    $r3$.ɵɵconditionalBranchCreate(2, TestComponent_Primary_1_Primary_2_Template, 1, 0)(3, TestComponent_Primary_1_Error_3_Template, 1, 0);
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵboundaryUpdate(1, $r3$.ɵɵgetBoundary(1).error === null ? 2 : 3, 2);
  }
}
function TestComponent_Error_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Outer Fallback ");
  }
}
…
function TestComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵboundaryCreate(0);
    $r3$.ɵɵconditionalBranchCreate(1, TestComponent_Primary_1_Template, 4, 1)(2, TestComponent_Error_2_Template, 1, 0);
  }
  if (rf & 2) {
    $r3$.ɵɵboundaryUpdate(0, $r3$.ɵɵgetBoundary(0).error === null ? 1 : 2, 1);
  }
}
