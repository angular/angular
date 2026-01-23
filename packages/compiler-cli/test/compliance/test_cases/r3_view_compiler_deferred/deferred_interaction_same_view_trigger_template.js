function MyApp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0);
    $r3$.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 0, 0);
    $r3$.ɵɵdefer(2, 1);
    $r3$.ɵɵdeferOnInteraction(7);
    $r3$.ɵɵdeferPrefetchOnInteraction(7);
    $r3$.ɵɵelementStart(4, "div")(5, "div")(6, "div")(7, "button", null, 0);
    $r3$.ɵɵtext(9, "Click me");
    $r3$.ɵɵelementEnd()()()();
  }
  if (rf & 2) {
    $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
  }
}
