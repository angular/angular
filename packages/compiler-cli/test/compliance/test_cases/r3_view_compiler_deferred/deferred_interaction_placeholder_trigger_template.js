function MyApp_DeferPlaceholder_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div")(1, "div")(2, "button", null, 0);
    $r3$.ɵɵtext(4, "Click me");
    $r3$.ɵɵelementEnd()()();
  }
}
…
function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 0)(2, MyApp_DeferPlaceholder_2_Template, 5, 0);
    $r3$.ɵɵdefer(3, 1, null, null, 2);
    $r3$.ɵɵdeferOnInteraction(2, -1);
    $r3$.ɵɵdeferPrefetchOnInteraction(2, -1);
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
  }
}
