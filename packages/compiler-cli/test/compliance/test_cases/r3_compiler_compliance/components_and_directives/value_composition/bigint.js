template:  function MyApp_Template(rf, ctx) {
  // ...
  if (rf & 2) {
    $r3$.ɵɵadvance();
    $r3$.ɵɵtextInterpolate1("Total: ", 1234n * ctx.multiplier, "");
  }
}
