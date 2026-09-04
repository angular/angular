function TestComponent_Primary_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Main Content ");
  }
}
function TestComponent_Error_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Fallback Content ");
  }
}
…
function TestComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵboundaryCreate(0);
    $r3$.ɵɵconditionalBranchCreate(1, TestComponent_Primary_1_Template, 1, 0)(2, TestComponent_Error_2_Template, 1, 0);
  }
  if (rf & 2) {
    $r3$.ɵɵboundaryUpdate(0, $r3$.ɵɵgetBoundary(0).error === null ? 1 : 2, 1);
  }
}
