template: function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    let $tmp_0_0$;
    let $tmp_1_0$;
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate1("Hello, ", ($tmp_0_0$ = ctx.firstName) !== null && $tmp_0_0$ !== undefined ? $tmp_0_0$ : "Frodo", "!");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Your last name is ", ($tmp_1_0$ = ($tmp_1_0$ = ctx.lastName) !== null && $tmp_1_0$ !== undefined ? $tmp_1_0$ : ctx.lastNameFallback) !== null && $tmp_1_0$ !== undefined ? $tmp_1_0$ : "unknown", "");
  }
}
