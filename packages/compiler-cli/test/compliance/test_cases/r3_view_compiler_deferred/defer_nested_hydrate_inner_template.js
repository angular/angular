function InnerCmp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, " hello ");
  }
}
…
template: function InnerCmp_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵdomTemplate(0, InnerCmp_Defer_0_Template, 1, 0);
    $r3$.ɵɵenableIncrementalHydrationRuntime();
    $r3$.ɵɵdefer(1, 0, null, null, null, null, null, null, null, 1);
    $r3$.ɵɵdeferHydrateOnIdle();
    $r3$.ɵɵdeferOnIdle();
  }
},
