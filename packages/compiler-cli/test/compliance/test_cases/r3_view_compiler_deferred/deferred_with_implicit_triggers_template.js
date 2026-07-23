function MyApp_DeferPlaceholder_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "button");
    $r3$.ɵɵtext(1, "Click me");
    $r3$.ɵɵelementEnd();
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 1)(1, MyApp_DeferPlaceholder_1_Template, 2, 0);
    $r3$.ɵɵdefer(2, 0, null, null, 1);
    $r3$.ɵɵdeferOnHover(0, -1);
    $r3$.ɵɵdeferOnInteraction(0, -1);
    $r3$.ɵɵdeferOnViewport(0, -1);
    $r3$.ɵɵdeferPrefetchOnHover(0, -1);
    $r3$.ɵɵdeferPrefetchOnInteraction(0, -1);
    $r3$.ɵɵdeferPrefetchOnViewport(0, -1);
  }
}
