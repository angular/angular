template:  function MyApp_Template(rf, ctx) {
  // ...
  if (rf & 2) {
    $r3$.ɵɵadvance(1);
    $r3$.ɵɵtextInterpolate1("Total: $", 1000000 * ctx.multiplier, "");
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵtextInterpolate1("Remaining: $", 123456.789 / 2, "");
  }
}
