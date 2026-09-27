function TestCmp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Name: ");
    $r3$.ɵɵelementStart(1, "input", 0);
    $r3$.ɵɵcontrolCreate();
    $r3$.ɵɵtwoWayListener("ngModelChange", function TestCmp_Template_input_ngModelChange_1_listener($event) {
      $r3$.ɵɵtwoWayBindingSet(ctx.name, $event) || (ctx.name = $event);
      return $event;
    });
    $r3$.ɵɵelementEnd();
  } if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("ngModel", ctx.name);
    $r3$.ɵɵcontrol();
  }
}
