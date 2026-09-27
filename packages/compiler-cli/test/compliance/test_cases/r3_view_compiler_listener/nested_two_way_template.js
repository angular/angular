function TestCmp_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    const $_r2$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "input", 0);
    $r3$.ɵɵcontrolCreate();
    $r3$.ɵɵtwoWayListener("ngModelChange", function TestCmp_ng_template_1_Template_input_ngModelChange_0_listener($event) {
      $r3$.ɵɵrestoreView($_r2$);
      const $ctx_r1$ = $r3$.ɵɵnextContext();
      $r3$.ɵɵtwoWayBindingSet($ctx_r1$.name, $event) || ($ctx_r1$.name = $event);
      return $r3$.ɵɵresetView($event);
    });
    $r3$.ɵɵelementEnd();
  } if (rf & 2) {
    const $ctx_r0$ = $r3$.ɵɵnextContext();
    $r3$.ɵɵtwoWayProperty("ngModel", $ctx_r0$.name);
    $r3$.ɵɵcontrol();
  }
}