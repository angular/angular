function TestCmp_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, "Name: ");
    i0.ɵɵelementStart(1, "input", 0);
    i0.ɵɵlistener("ngModelChange", function TestCmp_Template_input_ngModelChange_1_listener($event) {
      return ctx.name = $event;
    });
    i0.ɵɵelementEnd();
  } if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngModel", ctx.name);
  }
}
