function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0);
    $r3$.ɵɵenableIncrementalHydrationRuntime();
    $r3$.ɵɵdefer(1, 0, null, null, null, null, null, null, null, 1);
    $r3$.ɵɵdeferHydrateOnIdle();
    $r3$.ɵɵdeferOnIdle();
    $r3$.ɵɵdomTemplate(3, MyApp_Defer_3_Template, 1, 0);
    $r3$.ɵɵdefer(4, 3, null, null, null, null, null, null, null, 1);
    $r3$.ɵɵdeferHydrateOnTimer(500);
    $r3$.ɵɵdeferOnIdle();
  }
}
