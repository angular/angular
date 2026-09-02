function TestComponent_Primary_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " Main Content ");
  }
}
function TestComponent_Error_2_Template(rf, ctx) {
  if (rf & 1) {
    const $r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵdomElementStart(0, "button", 0);
    $r3$.ɵɵdomListener("click", function TestComponent_Error_2_Template_button_click_0_listener() {
      const $ctx_r1$ = $r3$.ɵɵrestoreView($r1$);
      return $r3$.ɵɵresetView($ctx_r1$.$retry());
    });
    $r3$.ɵɵtext(1, "Retry");
    $r3$.ɵɵdomElementEnd();
  }
}
…
function TestComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵboundaryCreate(0);
    $r3$.ɵɵconditionalBranchCreate(1, TestComponent_Primary_1_Template, 1, 0)(2, TestComponent_Error_2_Template, 2, 0);
  }
  if (rf & 2) {
    $r3$.ɵɵboundaryUpdate(0, $r3$.ɵɵgetBoundary(0).error === null ? 1 : 2, 1);
  }
}
