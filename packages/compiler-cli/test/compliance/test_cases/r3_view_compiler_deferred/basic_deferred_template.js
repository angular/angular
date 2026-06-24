function MyApp_Defer_2_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Deferred content");
  }
}…
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵelementStart(0, "div");
      $r3$.ɵɵtext(1);
      $r3$.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 1, 0);
      $r3$.ɵɵdefer(3, 2);
      $r3$.ɵɵdeferOnIdle();
      $r3$.ɵɵelementStart(5, "p");
      $r3$.ɵɵtext(6, "Content after defer block");
      $r3$.ɵɵelementEnd()();
    }
    if (rf & 2) {
      $r3$.ɵɵadvance();
      $r3$.ɵɵtextInterpolate1(" ", ctx.message, " ");
    }
  },
  …
});
…
$r3$.ɵsetClassMetadata(MyApp, …);
