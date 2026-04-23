function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0)(1, MyApp_DeferPlaceholder_1_Template, 2, 0);
    $r3$.ɵɵenableIncrementalHydrationRuntime();
    $r3$.ɵɵdefer(2, 0, null, null, 1, null, null, null, null, 1);
    $r3$.ɵɵdeferHydrateOnTimer(1337);
    $r3$.ɵɵdeferPrefetchOnViewport(0, -1);
  }
  if (rf & 2) {
    $r3$.ɵɵadvance(2);
    $r3$.ɵɵdeferWhen(ctx.isReady);
  }
}
