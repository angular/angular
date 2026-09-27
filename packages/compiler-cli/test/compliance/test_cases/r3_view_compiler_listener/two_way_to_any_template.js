function TestCmp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "input", 0);
    $r3$.ɵɵcontrolCreate();
    $r3$.ɵɵtwoWayListener("ngModelChange", function TestCmp_Template_input_ngModelChange_0_listener($event) {
      $r3$.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
      return $event;
    });
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵtwoWayProperty("ngModel", ctx.value);
    $r3$.ɵɵcontrol();
  }
}
