function MyApp_Defer_0_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Deferred content");
  }
}
function MyApp_DeferPlaceholder_1_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵtext(0, "Placeholder");
  }
}
…
export class MyApp {
  …
  static ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      $r3$.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0)(1, MyApp_DeferPlaceholder_1_Template, 1, 0);
      $r3$.ɵɵdefer(2, 0, null, null, 1);
      $r3$.ɵɵdeferOnTimer(500);
      $r3$.ɵɵdeferOnLoaded(() => ctx.onDeferredLoaded());
    }
  },
  …
});
…
