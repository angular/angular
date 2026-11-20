function MyApp_DeferError_1_Template(rf, ctx) {
  if (rf & 1) {
    const $r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "p");
    $r3$.ɵɵtext(1);
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵelementStart(2, "button", 0);
    $r3$.ɵɵlistener("click", function MyApp_DeferError_1_Template_button_click_2_listener() {
      const $ctx_r1$ = $r3$.ɵɵrestoreView($r1$);
      return $r3$.ɵɵresetView($ctx_r1$.$retry());
    });
    $r3$.ɵɵtext(3, "Retry");
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate2("", ctx.$error.message, " ", ctx.$error.name);
  }
}
…
$r3$.ɵɵdefer(2, 0, MyApp_Defer_2_DepsFn, null, null, 1, null, null, null, null, 0, $r3$.ɵɵdeferEnableRetry);
