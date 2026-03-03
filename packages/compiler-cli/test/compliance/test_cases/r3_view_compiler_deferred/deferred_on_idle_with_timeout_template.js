function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 1)(1, MyApp_DeferPlaceholder_1_Template, 2, 0);
    $r3$.ɵɵdefer(2, 0, null, null, 1);
    $r3$.ɵɵdeferOnIdle(500);
  }
  …
}
