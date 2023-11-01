function TestCmp_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    const $_r2$ = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "input", 0);
    i0.ɵɵlistener("ngModelChange", function TestCmp_ng_template_1_Template_input_ngModelChange_0_listener($event) {
      i0.ɵɵrestoreView($_r2$);
      const $ctx_r1$ = i0.ɵɵnextContext();
      return i0.ɵɵresetView($ctx_r1$.name = $event);
    });
    i0.ɵɵelementEnd();
  } if (rf & 2) {
    const $ctx_r0$ = i0.ɵɵnextContext();
    i0.ɵɵproperty("ngModel", $ctx_r0$.name);
  }
}