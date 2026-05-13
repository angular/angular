function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 1);
    $r3$.ɵɵenableIncrementalHydrationRuntime();
    $r3$.ɵɵdefer(2, 1, null, null, null, null, null, null, null, 1);
    $r3$.ɵɵdeferHydrateOnViewport({rootMargin: "123px", threshold: 59});
    $r3$.ɵɵdeferOnIdle();
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
  }
}
