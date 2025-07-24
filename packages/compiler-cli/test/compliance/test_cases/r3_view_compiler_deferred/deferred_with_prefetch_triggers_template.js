function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 1)(2, MyApp_DeferPlaceholder_2_Template, 3, 0);
    $r3$.ɵɵdefer(3, 1, null, null, 2);
    $r3$.ɵɵdeferPrefetchOnIdle();
    $r3$.ɵɵdeferPrefetchOnImmediate();
    $r3$.ɵɵdeferPrefetchOnTimer(1337);
    $r3$.ɵɵdeferPrefetchOnHover(0, -1);
    $r3$.ɵɵdeferPrefetchOnInteraction(0, -1);
    $r3$.ɵɵdeferPrefetchOnViewport(0, -1);
    $r3$.ɵɵdeferOnIdle();
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    $r3$.ɵɵadvance(3);
    $r3$.ɵɵdeferPrefetchWhen(ctx.isVisible() || ctx.isReady);
  }
}
