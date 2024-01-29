function TestCmp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Name: ");
    $r3$.ɵɵelementStart(1, "input", 0);
    $r3$.ɵɵlistener("ngModelChange", function TestCmp_Template_input_ngModelChange_1_listener($event) {
      return ctx.name = $event;
    });
    $r3$.ɵɵelementEnd();
  } if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtwoWayProperty("ngModel", ctx.name);
  }
}
