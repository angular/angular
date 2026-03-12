function TestCmp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const $_r1$ = $r3$.ɵɵgetCurrentView();
    $r3$.ɵɵelementStart(0, "input", 1);
    $r3$.ɵɵtwoWayListener("ngModelChange", function TestCmp_For_1_Template_input_ngModelChange_0_listener($event) {
      const $name_r2$ = $r3$.ɵɵrestoreView($_r1$).$implicit;
      $r3$.ɵɵtwoWayBindingSet($name_r2$, $event);
      return $r3$.ɵɵresetView($event);
    });
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    const $name_r2$ = ctx.$implicit;
    $r3$.ɵɵtwoWayProperty("ngModel", $name_r2$);
  }
}

…

function TestCmp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵrepeaterCreate(0, TestCmp_For_1_Template, 1, 1, "input", 0, $r3$.ɵɵrepeaterTrackByIndex);
  }
  if (rf & 2) {
    $r3$.ɵɵrepeater(ctx.names);
  }
}
