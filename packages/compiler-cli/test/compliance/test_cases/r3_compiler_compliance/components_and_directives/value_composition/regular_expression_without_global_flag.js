const $_c0$ = /^hello/i;
…
function TestComp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate($_c0$.test(ctx.value));
  }
}
