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
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Hello, ", ctx.firstName ?? "Frodo", "!");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Your last name is ", ctx.lastName ?? ctx.lastNameFallback ?? "unknown");
  }
}
