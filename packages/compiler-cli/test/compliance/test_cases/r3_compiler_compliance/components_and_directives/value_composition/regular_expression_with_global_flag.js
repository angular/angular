function TestComp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate(/^hello/g.test(ctx.value));
  }
}
