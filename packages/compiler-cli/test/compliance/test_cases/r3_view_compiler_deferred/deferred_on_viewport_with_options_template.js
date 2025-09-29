function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 1)(2, MyApp_DeferPlaceholder_2_Template, 3, 0);
    $r3$.ɵɵdefer(3, 1, null, null, 2);
    $r3$.ɵɵdeferOnViewport(0, -1, {rootMargin: "123px", threshold: 59});
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
  }
}
